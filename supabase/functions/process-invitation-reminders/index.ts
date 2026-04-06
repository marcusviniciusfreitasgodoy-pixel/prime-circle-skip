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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Find pending invitations not reminded in the last 7 days
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('*, referrer:profiles!invitations_referrer_id_fkey(id, full_name)')
      .eq('status', 'pending')
      .or(`last_reminder_at.is.null,last_reminder_at.lt.${sevenDaysAgo}`)

    if (error) throw error

    let processed = 0
    for (const inv of invitations || []) {
      const msg = `Olá ${inv.invitee_name}! ⏳ Passando para lembrar que o corretor ${inv.referrer?.full_name || 'Parceiro'} te convidou para a Prime Circle, uma rede privada para corretores de alto padrão.\n\nNão perca a chance de fechar mais parcerias 50/50 com segurança!\n\nCadastre-se agora: https://www.primecircle.app.br/?ref=${inv.referrer_id}`

      if (inv.invitee_phone) {
        const { error: waErr } = await supabase.functions.invoke('send-whatsapp', {
          body: { number: inv.invitee_phone, text: msg, user_id: inv.referrer_id },
        })
        if (waErr) console.error(waErr)
      }

      if (inv.invitee_email) {
        const { error: emailErr } = await supabase.functions.invoke('send-email', {
          body: {
            to: inv.invitee_email,
            subject: 'Lembrete: Seu convite para a Prime Circle',
            text: msg,
            user_id: inv.referrer_id,
          },
        })
        if (emailErr) console.error(emailErr)
      }

      await supabase
        .from('invitations')
        .update({
          last_reminder_at: new Date().toISOString(),
          reminder_count: (inv.reminder_count || 0) + 1,
        })
        .eq('id', inv.id)

      processed++
    }

    return new Response(JSON.stringify({ success: true, processed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders })
  }
})
