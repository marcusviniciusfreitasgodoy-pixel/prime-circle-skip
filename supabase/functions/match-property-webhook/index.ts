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

        const propLocation = (
          property.metadata.endereco ||
          property.metadata.location ||
          ''
        ).toLowerCase()
        const propBairro = (property.metadata.bairro || '').toLowerCase()
        const propTipo = (property.metadata.tipo_imovel || '').toLowerCase()
        const propValor = property.metadata.valor || 0
        const propTitle = property.metadata.tipo_imovel
          ? `${property.metadata.tipo_imovel} em ${property.metadata.bairro || property.metadata.endereco}`
          : property.metadata.title || 'Imóvel'

        // Fetch all Demands to find potential matches
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
          const demandEndereco = (
            demand.metadata.endereco ||
            demand.metadata.region ||
            ''
          ).toLowerCase()
          const demandBairro = (demand.metadata.bairro || '').toLowerCase()
          const demandTipo = (demand.metadata.tipo_imovel || '').toLowerCase()
          const demandValor = demand.metadata.valor || 999999999

          const isTypeMatch =
            !demandTipo || propTipo.includes(demandTipo) || demandTipo.includes(propTipo)

          const isValuePerfect = propValor <= demandValor
          const isValuePartial = propValor > demandValor && propValor <= demandValor * 1.1

          const isLocationMatch =
            (propBairro &&
              demandBairro &&
              (propBairro.includes(demandBairro) || demandBairro.includes(propBairro))) ||
            (propLocation &&
              demandEndereco &&
              (propLocation.includes(demandEndereco) || demandEndereco.includes(propLocation))) ||
            (propBairro && demandEndereco && demandEndereco.includes(propBairro))

          const isLegacyMatch =
            !property.metadata.bairro &&
            propLocation.includes(demandEndereco) &&
            (isValuePerfect || isValuePartial)

          const isMatch =
            (isTypeMatch && (isValuePerfect || isValuePartial) && isLocationMatch) || isLegacyMatch

          if (isMatch && demand.metadata.user_id) {
            const { data: brokerProfile } = await supabase
              .from('profiles')
              .select('id, full_name, whatsapp_number')
              .eq('id', demand.metadata.user_id)
              .single()

            if (brokerProfile && brokerProfile.whatsapp_number) {
              const brokerName = brokerProfile.full_name || 'Corretor'

              const formattedPrice = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
              }).format(propValor)
              const propertyDetails = `${propTitle} - R$ ${formattedPrice}`

              // Load custom template if exists
              const { data: templates } = await supabase
                .from('notification_templates')
                .select('*')
                .eq('user_id', brokerProfile.id)
                .eq('name', 'Notificação de Match - WhatsApp')
                .single()

              let waMessage = `Olá ${brokerName}, encontramos um imóvel que é um match perfeito para sua demanda: ${propertyDetails}. Confira agora no seu Dashboard!`

              if (templates && templates.content) {
                waMessage = templates.content
                  .replace(/\{\{partner_name\}\}/g, brokerName)
                  .replace(/\{\{property_details\}\}/g, propertyDetails)
              }

              if (isValuePartial) {
                waMessage = waMessage.replace(/match perfeito/gi, 'match parcial')
              }

              waMessage += `\n\nAvalie este match:\n✅ Match Válido: https://www.primecircle.app.br/match-feedback?id=${property.id}&type=perfect\n❌ Não Atende: https://www.primecircle.app.br/match-feedback?id=${property.id}&type=not_suitable`

              notificationPromises.push(
                supabase.functions
                  .invoke('send-whatsapp', {
                    body: {
                      number: brokerProfile.whatsapp_number,
                      text: waMessage,
                      user_id: brokerProfile.id,
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
