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
        const property = payload.record

        if (!property || !property.metadata || property.metadata.type !== 'oferta') {
          return
        }

        const propLocation = (property.metadata.location || '').toLowerCase()
        const propTitle = property.metadata.title || 'Imóvel'
        const propPrice = property.metadata.price || 'Valor sob consulta'

        // 1. Fetch all Demands to find potential matches
        // In a real scenario with populated vector embeddings, we would use match_documents RPC here.
        // For this implementation, we simulate a keyword-based similarity search using the location/region.
        const { data: demands, error: demandsError } = await supabase
          .from('documents')
          .select('*')
          .contains('metadata', { type: 'demanda' })

        if (demandsError || !demands) {
          console.error('Failed to fetch demands:', demandsError)
          return
        }

        const notificationPromises = []

        for (const demand of demands) {
          const demandRegion = (demand.metadata.region || '').toLowerCase()

          // Simple similarity match fallback: Does the property location overlap with the demand region?
          const isMatch = propLocation.includes(demandRegion) || demandRegion.includes(propLocation)

          if (isMatch && demand.metadata.user_id) {
            // Get the broker who owns the demand
            const { data: brokerProfile } = await supabase
              .from('profiles')
              .select('id, full_name, whatsapp_number')
              .eq('id', demand.metadata.user_id)
              .single()

            if (brokerProfile && brokerProfile.whatsapp_number) {
              const brokerName = brokerProfile.full_name || 'Corretor'

              // Standard Template Required by AC with Feedback Links
              const waMessage = `Olá ${brokerName}, encontramos um imóvel que é o match perfeito para sua demanda: ${propTitle} - ${propPrice} em ${property.metadata.location}. Confira agora no seu Dashboard!\n\nAvalie este match:\n✅ Match Perfeito: https://prime-circle-migration-fd549.goskip.app/match-feedback?id=${property.id}&type=perfect\n❌ Não Atende: https://prime-circle-migration-fd549.goskip.app/match-feedback?id=${property.id}&type=not_suitable`

              // Invoke send-whatsapp to deliver and log the notification automatically
              notificationPromises.push(
                supabase.functions
                  .invoke('send-whatsapp', {
                    body: {
                      number: brokerProfile.whatsapp_number,
                      text: waMessage,
                      user_id: brokerProfile.id,
                    },
                  })
                  .catch((err) => console.error('Error triggering WhatsApp invoke:', err)),
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

    return new Response(JSON.stringify({ success: true, message: 'Matching asynchronously' }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Match property webhook parse error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
