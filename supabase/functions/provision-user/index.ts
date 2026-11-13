// provision-user: cria ou vincula, na rede de corretores, um usuário que se
// cadastrou na plataforma Prime Circle. Chamada servidor a servidor, nunca pelo navegador.
//
// Autenticação: HMAC-SHA256 com segredo compartilhado.
//   X-PC-Timestamp: segundos Unix do momento do envio
//   X-PC-Signature: hex( HMAC_SHA256( PRIMECIRCLE_PROVISIONING_SECRET, `${timestamp}.${corpo_bruto}` ) )
// Publicar com: supabase functions deploy provision-user --no-verify-jwt

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const MAX_SKEW_SECONDS = 300
const SOURCE = 'primecircle_saas'

type Payload = {
  external_id: string
  email: string
  full_name?: string
  whatsapp_number?: string
  creci?: string
  region?: string
  company_name?: string
  initial_status?: 'active' | 'pending_validation'
  send_login_link?: boolean
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function validSignature(secret: string, timestamp: string, rawBody: string, signature: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`))
  return safeEqual(toHex(mac), signature.toLowerCase())
}

function clean(v: unknown, max = 200): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t ? t.slice(0, max) : undefined
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const secret = Deno.env.get('PRIMECIRCLE_PROVISIONING_SECRET') ?? ''
  if (secret.length < 32) return json(500, { error: 'provisioning_not_configured' })

  const timestamp = req.headers.get('x-pc-timestamp') ?? ''
  const signature = req.headers.get('x-pc-signature') ?? ''
  const rawBody = await req.text()

  const ts = Number(timestamp)
  if (!Number.isInteger(ts) || Math.abs(Date.now() / 1000 - ts) > MAX_SKEW_SECONDS) {
    return json(401, { error: 'invalid_timestamp' })
  }
  if (!signature || !(await validSignature(secret, timestamp, rawBody, signature))) {
    return json(401, { error: 'invalid_signature' })
  }

  let body: Payload
  try {
    body = JSON.parse(rawBody)
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const externalId = clean(body.external_id, 100)
  const email = clean(body.email, 254)?.toLowerCase()
  if (!externalId) return json(400, { error: 'external_id_required' })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: 'invalid_email' })
  // Cliente da plataforma entra ativo; a validação manual só acontece se pedida
  const initialStatus = body.initial_status === 'pending_validation' ? 'pending_validation' : 'active'

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  try {
    // 1. Já foi provisionado antes? Repetir a chamada não duplica nada.
    const { data: byExternal, error: e1 } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('external_id', externalId)
      .maybeSingle()
    if (e1) throw e1

    let userId: string | null = byExternal?.id ?? null
    let result: 'exists' | 'linked' | 'created' = 'exists'

    if (!userId) {
      // 2. Já tem conta na rede com esse e-mail? Só vincula, não mexe em plano nem status.
      const { data: existingId, error: e2 } = await supabase.rpc('get_user_id_by_email', { p_email: email })
      if (e2) throw e2

      if (existingId) {
        const { data: linked, error: e3 } = await supabase
          .from('profiles')
          .update({ external_id: externalId, provisioned_at: new Date().toISOString() })
          .eq('id', existingId)
          .is('external_id', null)
          .select('id')
        if (e3) throw e3
        if (!linked || linked.length === 0) {
          return json(409, { error: 'email_linked_to_other_external_id' })
        }
        userId = existingId as string
        result = 'linked'
      } else {
        // 3. Conta nova. O gatilho do banco cria o perfil lendo app_metadata.
        const { data: created, error: e4 } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          app_metadata: { provisioned_by: SOURCE, external_id: externalId, initial_status: initialStatus },
          user_metadata: {
            full_name: clean(body.full_name),
            whatsapp_number: clean(body.whatsapp_number, 30),
            creci: clean(body.creci, 30),
            region: clean(body.region),
            company_name: clean(body.company_name),
          },
        })
        if (e4) throw e4
        userId = created.user.id
        result = 'created'

        const { data: prof, error: e5 } = await supabase
          .from('profiles')
          .select('id, external_id')
          .eq('id', userId)
          .maybeSingle()
        if (e5) throw e5
        if (!prof || prof.external_id !== externalId) {
          return json(500, { error: 'profile_not_created', user_id: userId })
        }
      }
    }

    // 4. Link de acesso opcional, para a plataforma redirecionar o usuário já logado.
    // É uma credencial de login: só trafega servidor a servidor e não deve ir para log.
    let loginLink: string | undefined
    if (body.send_login_link) {
      const { data: link, error: e6 } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: `${Deno.env.get('SITE_URL') ?? ''}/auth/confirm` },
      })
      if (e6) throw e6
      loginLink = link.properties?.action_link
    }

    return json(result === 'created' ? 201 : 200, { result, user_id: userId, login_link: loginLink })
  } catch (err) {
    console.error('provision-user error:', (err as Error)?.message ?? err)
    return json(500, { error: 'internal_error' })
  }
})
