import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload = await req.json()
    const partnerships = payload.partnerships || []

    if (partnerships.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No partnerships to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const baseUrl = Deno.env.get('BASE_URL') || 'https://www.primecircle.app.br'

    for (const p of partnerships) {
      const { data: brokerProperty } = await supabase
        .from('profiles')
        .select('id, full_name, whatsapp_number')
        .eq('id', p.broker_property_id)
        .single()
      const { data: brokerDemand } = await supabase
        .from('profiles')
        .select('id, full_name, whatsapp_number')
        .eq('id', p.broker_demand_id)
        .single()
      const { data: propertyDoc } = await supabase
        .from('documents')
        .select('metadata')
        .eq('id', p.property_id)
        .single()

      if (!brokerProperty || !brokerDemand || !propertyDoc) continue

      const propertyType = propertyDoc.metadata?.tipo_imovel || 'Imóvel'
      const propertyRegion =
        propertyDoc.metadata?.bairro || propertyDoc.metadata?.region || 'Região'
      const propertyName = `${propertyType} em ${propertyRegion}`

      const getNextStatus = (current: string) => {
        switch (current) {
          case 'match':
            return 'contact'
          case 'contact':
            return 'visit'
          case 'visit':
            return 'proposal'
          case 'proposal':
            return 'closed'
          default:
            return null
        }
      }

      const nextStatus = getNextStatus(p.status)
      if (!nextStatus) continue

      const sendToBroker = async (broker: any, partner: any) => {
        if (!broker.whatsapp_number) return

        const { data: tokenData } = await supabase
          .from('quick_action_tokens')
          .insert({
            partnership_id: p.id,
            corretor_id: broker.id,
            action: 1,
            status_alvo: nextStatus,
          })
          .select('token')
          .single()

        if (!tokenData) return

        const updateLink = `${baseUrl}/quick-update?t=${tokenData.token}&s=${nextStatus}&b=${broker.id}`
        const displayStatusMap: Record<string, string> = {
          contact: 'CONTATO',
          visit: 'VISITA',
          proposal: 'PROPOSTA',
          closed: 'FECHAMENTO',
        }
        const displayStatus = displayStatusMap[nextStatus] || nextStatus.toUpperCase()

        const text = `Olá ${broker.full_name}, como está a negociação do ${propertyName} com o parceiro ${partner.full_name}?\n\nA parceria avançou para a etapa de *${displayStatus}*?\n\n👉 Confirme aqui em 1 clique:\n${updateLink}`

        await supabase.functions.invoke('send-whatsapp', {
          body: { number: broker.whatsapp_number, text, user_id: broker.id },
        })
      }

      await sendToBroker(brokerProperty, brokerDemand)
      await sendToBroker(brokerDemand, brokerProperty)

      await supabase
        .from('partnerships')
        .update({
          last_status_check_at: new Date().toISOString(),
          status_check_count: p.status_check_count + 1,
        })
        .eq('id', p.id)
    }

    return new Response(JSON.stringify({ success: true, processed: partnerships.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
