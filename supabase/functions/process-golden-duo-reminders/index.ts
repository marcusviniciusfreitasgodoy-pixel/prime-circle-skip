import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json().catch(() => ({}))

    // Security lock: do not send before 09:00 AM BRT
    const now = new Date()
    const brtHour = (now.getUTCHours() - 3 + 24) % 24
    if (brtHour < 9 && !payload?.bypass_time_check) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Time restriction: Cannot send before 09:00 AM BRT',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find active users created > 48h ago, and no golden duo reminder sent
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, full_name, whatsapp_number, email')
      .eq('status', 'active')
      .is('golden_duo_reminder_sent_at', null)
      .lt('created_at', fortyEightHoursAgo)

    if (pError) throw pError
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No profiles to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let processed = 0
    for (const profile of profiles) {
      const { data: docs } = await supabase
        .from('documents')
        .select('metadata')
        .eq('metadata->>user_id', profile.id)

      let offers = 0
      let demands = 0

      if (docs) {
        offers = docs.filter((d) => d.metadata?.type === 'oferta').length
        demands = docs.filter((d) => d.metadata?.type === 'demanda').length
      }

      const fullName = profile.full_name ? profile.full_name.split(' ')[0] : 'Parceiro'
      let templateName = null
      let defaultMsg = ''

      if (offers > 0 && demands === 0) {
        templateName = 'Duo de Ouro - Falta Demanda'
        defaultMsg = `Olá ${fullName}! Notamos que você já cadastrou um imóvel, mas ainda não incluiu nenhuma demanda. 🎯 Para ativar o "Duo de Ouro" e maximizar seus matches, cadastre agora o que seu cliente procura: https://www.primecircle.app.br/dashboard`
      } else if (demands > 0 && offers === 0) {
        templateName = 'Duo de Ouro - Falta Oferta'
        defaultMsg = `Olá ${fullName}! Notamos que você já cadastrou uma demanda, mas ainda não incluiu nenhum imóvel. 🏠 Para ativar o "Duo de Ouro" e ser encontrado por outros corretores, cadastre seus imóveis agora: https://www.primecircle.app.br/dashboard`
      } else if (offers > 0 && demands > 0) {
        await supabase
          .from('profiles')
          .update({ golden_duo_reminder_sent_at: new Date().toISOString() })
          .eq('id', profile.id)
        continue
      } else {
        continue
      }

      if (templateName) {
        let finalMsg = defaultMsg
        const { data: template } = await supabase
          .from('notification_templates')
          .select('content')
          .eq('user_id', profile.id)
          .eq('name', templateName)
          .single()

        if (template && template.content) {
          finalMsg = template.content.replace(/\{\{full_name\}\}/g, fullName)
        }

        if (profile.whatsapp_number) {
          await supabase.functions.invoke('send-whatsapp', {
            body: { number: profile.whatsapp_number, text: finalMsg, user_id: profile.id },
          })
        } else if (profile.email) {
          await supabase.functions.invoke('send-email', {
            body: {
              to: profile.email,
              subject: 'Ative seu Duo de Ouro na Prime Circle',
              text: finalMsg.replace(/\n/g, '<br/>'),
              user_id: profile.id,
            },
          })
        }

        await supabase
          .from('profiles')
          .update({ golden_duo_reminder_sent_at: new Date().toISOString() })
          .eq('id', profile.id)
        processed++
      }
    }

    return new Response(JSON.stringify({ success: true, processed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders })
  }
})
