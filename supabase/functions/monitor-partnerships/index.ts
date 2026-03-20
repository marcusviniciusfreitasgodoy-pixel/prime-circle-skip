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

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    const { data: stalePartnerships, error } = await supabase
      .from('partnerships')
      .select(`
        id, 
        update_token, 
        status, 
        broker_demand_id, 
        broker_property_id, 
        property_id,
        property:documents!partnerships_property_id_fkey(metadata)
      `)
      .lt('last_interaction_at', fortyEightHoursAgo)
      .not('status', 'in', '("closed", "cancelled")')
      .limit(50)

    if (error) {
      console.error('Error fetching stale partnerships:', error)
      throw error
    }

    let sentCount = 0

    for (const p of stalePartnerships || []) {
      const metadata = Array.isArray(p.property) ? p.property[0]?.metadata : p.property?.metadata
      const propertyTitle = metadata?.title || metadata?.tipo_imovel || 'Imóvel'

      const brokers = [p.broker_demand_id, p.broker_property_id].filter(Boolean)

      for (const brokerId of brokers) {
        const { data: broker } = await supabase
          .from('profiles')
          .select('full_name, whatsapp_number')
          .eq('id', brokerId)
          .single()

        if (broker && broker.whatsapp_number) {
          let nextStatus = 'contact'
          if (p.status === 'match') nextStatus = 'contact'
          else if (p.status === 'contact') nextStatus = 'visit'
          else if (p.status === 'visit') nextStatus = 'proposal'
          else if (p.status === 'proposal') nextStatus = 'closed'

          const link = `https://www.primecircle.app.br/quick-update?t=${p.update_token}&s=${nextStatus}&b=${brokerId}`
          const message = `Olá ${broker.full_name || 'Corretor'}, aqui é a Sofia! Notei que a negociação do imóvel ${propertyTitle} está sem atualizações há 2 dias. Como está o andamento? Clique abaixo para atualizar agora!\n\n${link}`

          await supabase.functions.invoke('send-whatsapp', {
            body: { number: broker.whatsapp_number, text: message, user_id: brokerId },
          })
          sentCount++
        }
      }

      await supabase
        .from('partnerships')
        .update({ last_interaction_at: new Date().toISOString() })
        .eq('id', p.id)
    }

    return new Response(
      JSON.stringify({ success: true, processed: stalePartnerships?.length || 0, sent: sentCount }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
