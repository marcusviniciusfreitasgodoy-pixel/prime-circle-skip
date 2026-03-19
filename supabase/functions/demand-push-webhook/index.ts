import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

declare const EdgeRuntime: any

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json()

    const processWebhook = async (payload: any) => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      try {
        const record = payload.record

        if (!record || record.metadata?.type !== 'demanda') {
          return
        }

        const title = 'Nova Demanda na Rede'
        const body = `Nova oportunidade cadastrada: ${record.metadata.tipo_imovel || 'Imóvel'} em ${record.metadata.region || record.metadata.bairro || 'sua região'}.`

        const { data: subs, error } = await supabase
          .from('user_push_subscriptions')
          .select('user_id')

        if (subs && subs.length > 0) {
          const uniqueUserIds = [...new Set(subs.map((s: any) => s.user_id))]
          const notificationPromises = uniqueUserIds.map((userId: string) =>
            supabase.rpc('log_notification', {
              p_user_id: userId,
              p_recipient: 'browser-push',
              p_channel: 'push',
              p_status: 'success',
              p_message_body: `Push Sent: ${title} - ${body}`,
              p_error_details: null,
            }),
          )
          await Promise.allSettled(notificationPromises)
        }
      } catch (err: any) {
        console.error('Webhook processing error:', err)
      }
    }

    if (typeof EdgeRuntime !== 'undefined' && typeof EdgeRuntime.waitUntil === 'function') {
      EdgeRuntime.waitUntil(processWebhook(payload))
    } else {
      processWebhook(payload).catch(console.error)
    }

    return new Response(JSON.stringify({ success: true, message: 'Processing asynchronously' }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Demand push webhook parse error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
