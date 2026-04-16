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
        const demand = payload.record

        if (!demand || !demand.metadata || demand.metadata.type !== 'demanda') {
          return
        }

        const demandEndereco = (
          demand.metadata.endereco ||
          demand.metadata.region ||
          ''
        ).toLowerCase()
        const demandBairro = (demand.metadata.bairro || '').toLowerCase()
        const demandTipo = (demand.metadata.tipo_imovel || '').toLowerCase()
        const demandValor = demand.metadata.valor || 999999999
        const demandTypeDisplay = demand.metadata.tipo_imovel || 'Imóvel'
        const demandRegionDisplay =
          demand.metadata.bairro ||
          demand.metadata.region ||
          demand.metadata.endereco ||
          'sua região'
        const demandDetails = `${demandTypeDisplay} em ${demandRegionDisplay}`

        const { data: properties, error: propError } = await supabase
          .from('documents')
          .select('metadata')
          .contains('metadata', { type: 'oferta' })

        let hasMatch = false

        if (properties) {
          for (const property of properties) {
            const propLocation = (
              property.metadata.endereco ||
              property.metadata.location ||
              ''
            ).toLowerCase()
            const propBairro = (property.metadata.bairro || '').toLowerCase()
            const propTipo = (property.metadata.tipo_imovel || '').toLowerCase()
            const propValor = property.metadata.valor || 0

            const isTypeMatch =
              !demandTipo || propTipo.includes(demandTipo) || demandTipo.includes(propTipo)
            const isValueMatch = propValor <= demandValor * 1.1
            const isLocationMatch =
              (propBairro &&
                demandBairro &&
                (propBairro.includes(demandBairro) || demandBairro.includes(propBairro))) ||
              (propLocation &&
                demandEndereco &&
                (propLocation.includes(demandEndereco) || demandEndereco.includes(propLocation))) ||
              (propBairro && demandEndereco && demandEndereco.includes(propBairro))
            const isLegacyMatch =
              !property.metadata.bairro && propLocation.includes(demandEndereco) && isValueMatch

            if ((isTypeMatch && isValueMatch && isLocationMatch) || isLegacyMatch) {
              hasMatch = true
              break
            }
          }
        }

        if (!hasMatch && demand.metadata.user_id) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('id, full_name, whatsapp_number')
            .eq('id', demand.metadata.user_id)
            .single()

          if (userProfile && userProfile.whatsapp_number) {
            const fullName = userProfile.full_name
              ? userProfile.full_name.split(' ')[0]
              : 'Parceiro'

            const { data: templates } = await supabase
              .from('notification_templates')
              .select('content')
              .eq('user_id', userProfile.id)
              .eq('name', 'Busca Inteligente - Sem Resultados')
              .single()

            let waMessage = `Olá ${fullName}! Vimos que sua nova demanda para ${demandDetails} ainda não teve matches na rede. 🔍 Que tal convidar um parceiro que atua nessa região? Se ele tiver o imóvel, vocês fecham negócio! Seu link: https://www.primecircle.app.br/?ref=${userProfile.id}`

            if (templates && templates.content) {
              waMessage = templates.content
                .replace(/\{\{full_name\}\}/g, fullName)
                .replace(/\{\{demand_details\}\}/g, demandDetails)
                .replace(/\{\{user_id\}\}/g, userProfile.id)
            }

            await supabase.functions.invoke('send-whatsapp', {
              body: {
                number: userProfile.whatsapp_number,
                text: waMessage,
                user_id: userProfile.id,
              },
            })
          }
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
    console.error('Smart search webhook parse error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
