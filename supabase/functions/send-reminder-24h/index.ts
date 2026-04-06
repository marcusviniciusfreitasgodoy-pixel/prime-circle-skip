import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json().catch(() => ({}))
    
    // Security lock: do not send before 09:00 AM BRT
    const now = new Date()
    const brtHour = (now.getUTCHours() - 3 + 24) % 24
    if (brtHour < 9 && !payload?.bypass_time_check) {
      return new Response(JSON.stringify({ success: false, message: 'Time restriction: Cannot send before 09:00 AM BRT' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // === 1. BUSCAR PARCERIAS ELEGÍVEIS ===
    const fortySevenHoursAgo = new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: partnerships, error } = await supabase
      .from('partnerships')
      .select(`
        *,
        broker_property:profiles!partnerships_broker_property_id_fkey(id, full_name, whatsapp_number),
        broker_demand:profiles!partnerships_broker_demand_id_fkey(id, full_name, whatsapp_number),
        property:documents!partnerships_property_id_fkey(metadata)
      `)
      .in('status', ['match', 'contact', 'visit', 'proposal'])
      .eq('reminder_sent', false)
      .gte('last_status_check_at', fortySevenHoursAgo)
      .lte('last_status_check_at', twentyFourHoursAgo)

    if (error) throw error

    if (!partnerships || partnerships.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No partnerships to process' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const baseUrl = Deno.env.get('BASE_URL') || 'https://www.primecircle.app.br'
    let processed = 0

    // === 2. PARA CADA PARCERIA ===
    for (const p of partnerships) {
      const propertyType = (p.property as any)?.metadata?.tipo_imovel || 'Imóvel'
      const propertyRegion = (p.property as any)?.metadata?.bairro || (p.property as any)?.metadata?.region || 'Região'

      const brokers = [
        { me: p.broker_property, partner: p.broker_demand },
        { me: p.broker_demand, partner: p.broker_property }
      ]

      for (const { me, partner } of brokers) {
        if (!me || !partner || !(me as any).whatsapp_number) continue;

        const { data: tokens } = await supabase
          .from('quick_action_tokens')
          .select('token, action, status_alvo')
          .eq('partnership_id', p.id)
          .eq('corretor_id', (me as any).id)
          .eq('used', false)
          .gt('expires_at', new Date().toISOString())
          .order('action', { ascending: true })

        if (!tokens || tokens.length < 3) continue;

        const tok1 = tokens.find(t => t.action === 1)
        const tok2 = tokens.find(t => t.action === 2)
        const tok3 = tokens.find(t => t.action === 3)

        if (!tok1 || !tok2 || !tok3) continue;

        const url1 = `${baseUrl}/quick-update?t=${tok1.token}&s=${tok1.status_alvo}&b=${(me as any).id}`
        const url2 = `${baseUrl}/quick-update?t=${tok2.token}&s=${tok2.status_alvo}&b=${(me as any).id}`
        const url3 = `${baseUrl}/quick-update?t=${tok3.token}&s=cancelled&b=${(me as any).id}`

        let opt1Text = "Sim, já falamos"
        let opt2Text = "Ainda não consegui"
        if (p.status === 'contact') {
          opt1Text = "Visita agendada ou realizada"
          opt2Text = "Em conversa, sem visita ainda"
        } else if (p.status === 'visit') {
          opt1Text = "Sim, proposta enviada"
          opt2Text = "Visita foi bem, mas sem proposta ainda"
        } else if (p.status === 'proposal') {
          opt1Text = "Negócio fechado! 🎉"
          opt2Text = "Em negociação ainda"
        }

        const firstNameMe = (me as any).full_name ? (me as any).full_name.split(' ')[0] : 'Corretor'
        const firstNamePartner = (partner as any).full_name ? (partner as any).full_name.split(' ')[0] : 'Parceiro'

        const text = `Oi ${firstNameMe} 👋 Só um lembrete da *PrimeCircle*.\n\nAinda aguardamos seu retorno sobre o match com *${firstNamePartner}* (${propertyType} · ${propertyRegion}).\n\nOs links abaixo continuam válidos:\n\n🔗 ${opt1Text}\n${url1}\n\n🔗 ${opt2Text}\n${url2}\n\n🔗 Encerrar este match\n${url3}\n\n_Links expiram em breve._`

        await supabase.functions.invoke('send-whatsapp', {
          body: { number: (me as any).whatsapp_number, text, user_id: (me as any).id }
        })
      }

      await supabase.from('partnerships').update({ reminder_sent: true } as any).eq('id', p.id)
      processed++
    }

    return new Response(JSON.stringify({ success: true, processed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
