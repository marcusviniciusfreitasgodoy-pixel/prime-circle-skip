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

        const demandType = record.metadata.tipo_imovel || 'Imóvel'
        const demandRegion =
          record.metadata.region ||
          record.metadata.bairro ||
          record.metadata.endereco ||
          'sua região'
        const demandDetails = `${demandType} em ${demandRegion}`

        const title = 'Nova Demanda na Rede'
        const body = `Nova oportunidade cadastrada: ${demandDetails}.`

        const notificationPromises = []

        // 1. Browser Push Notifications
        const { data: subs, error } = await supabase
          .from('user_push_subscriptions')
          .select('user_id')

        if (subs && subs.length > 0) {
          const uniqueUserIds = [...new Set(subs.map((s: any) => s.user_id))]
          uniqueUserIds.forEach((userId: string) => {
            notificationPromises.push(
              supabase.rpc('log_notification', {
                p_user_id: userId,
                p_recipient: 'browser-push',
                p_channel: 'push',
                p_status: 'success',
                p_message_body: `Push Sent: ${title} - ${body}`,
                p_error_details: null,
              }),
            )
          })
        }

        // 2. WhatsApp Notifications to Active Community
        const { data: activeProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, whatsapp_number')
          .eq('status', 'active')

        if (activeProfiles && activeProfiles.length > 0) {
          for (const profile of activeProfiles) {
            // Skip sending to the creator of the demand
            if (profile.id === record.metadata.user_id) continue

            if (profile.whatsapp_number) {
              const partnerName = profile.full_name || 'Parceiro'

              const { data: templates } = await supabase
                .from('notification_templates')
                .select('*')
                .eq('user_id', profile.id)
                .eq('name', 'Nova Demanda - WhatsApp')
                .single()

              let waMessage = `Olá ${partnerName}! 🚀 Uma nova demanda foi cadastrada na Prime Circle: ${demandDetails}. Acesse a plataforma para conferir e oferecer seus imóveis: https://www.primecircle.app.br/dashboard`

              if (templates && templates.content) {
                waMessage = templates.content
                  .replace(/\{\{partner_name\}\}/g, partnerName)
                  .replace(/\{\{demand_details\}\}/g, demandDetails)
              }

              notificationPromises.push(
                supabase.functions
                  .invoke('send-whatsapp', {
                    body: {
                      number: profile.whatsapp_number,
                      text: waMessage,
                      user_id: profile.id,
                    },
                  })
                  .then(({ error }) => {
                    if (error) console.error('Error triggering WhatsApp invoke:', error)
                  }),
              )
            }
          }
        }

        await Promise.allSettled(notificationPromises)
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
