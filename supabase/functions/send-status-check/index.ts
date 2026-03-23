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
      const currentStatus = p.status
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

      const nextStatus = getNextStatus(currentStatus)
      if (!nextStatus) continue

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

      const propertyType = propertyDoc?.metadata?.tipo_imovel || 'Imóvel'
      const propertyRegion =
        propertyDoc?.metadata?.bairro || propertyDoc?.metadata?.region || 'Região'

      const isReminder = (p.status_check_count || 0) > 0

      const brokers = [
        { me: brokerProperty, partner: brokerDemand },
        { me: brokerDemand, partner: brokerProperty },
      ]

      for (const { me, partner } of brokers) {
        if (!me || !partner) continue

        // 4. Validação explícita de telefone na coleta
        if (!me.whatsapp_number) {
          console.warn(`Corretor ${me.id} sem telefone cadastrado. Check pulado.`)
          await supabase.rpc('log_notification', {
            p_user_id: me.id,
            p_recipient: 'unknown',
            p_channel: 'whatsapp',
            p_status: 'failed',
            p_message_body: `Tentativa de check de status para o imóvel ${propertyType}`,
            p_error_details: 'Telefone do corretor ausente',
          })
          continue
        }

        let tokens = []

        // 3. Lembrete de 24h: Tentar reaproveitar tokens se for lembrete
        if (isReminder) {
          const { data: existingTokens } = await supabase
            .from('quick_action_tokens')
            .select('id, token, action')
            .eq('partnership_id', p.id)
            .eq('corretor_id', me.id)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())

          if (existingTokens && existingTokens.length >= 3) {
            tokens = existingTokens
          }
        }

        // Se não for lembrete ou não houver tokens válidos, gerar novos
        if (tokens.length === 0) {
          // Invalidar os antigos deste corretor
          await supabase
            .from('quick_action_tokens')
            .update({ used: true })
            .eq('partnership_id', p.id)
            .eq('corretor_id', me.id)
            .eq('used', false)

          const { data: newTokens, error: tokensError } = await supabase
            .from('quick_action_tokens')
            .insert([
              { partnership_id: p.id, corretor_id: me.id, action: 1, status_alvo: nextStatus },
              { partnership_id: p.id, corretor_id: me.id, action: 2, status_alvo: currentStatus },
              { partnership_id: p.id, corretor_id: me.id, action: 3, status_alvo: 'cancelled' },
            ])
            .select('id, token, action')

          if (tokensError || !newTokens || newTokens.length === 0) {
            console.error('Failed to create tokens', tokensError)
            continue
          }
          tokens = newTokens
        }

        const tok1 = tokens.find((t) => t.action === 1)
        const tok2 = tokens.find((t) => t.action === 2)
        const tok3 = tokens.find((t) => t.action === 3)

        if (!tok1 || !tok2 || !tok3) continue

        const url1 = `${baseUrl}/quick-update?t=${tok1.token}&s=${nextStatus}&b=${me.id}`
        const url2 = `${baseUrl}/quick-update?t=${tok2.token}&s=${currentStatus}&b=${me.id}`
        const url3 = `${baseUrl}/quick-update?t=${tok3.token}&s=cancelled&b=${me.id}`

        const firstNameMe = me.full_name ? me.full_name.split(' ')[0] : 'Corretor'
        const firstNamePartner = partner.full_name ? partner.full_name.split(' ')[0] : 'Parceiro'

        let text = ''
        const prefix = isReminder
          ? `⏳ *Lembrete PrimeCircle*\n\nOi ${firstNameMe}, ainda não tivemos retorno sobre o `
          : `Oi ${firstNameMe} 👋 *PrimeCircle* aqui.\n\n`

        if (currentStatus === 'match') {
          text = `${prefix}match com *${firstNamePartner}* (${propertyType} · ${propertyRegion}) confirmado há alguns dias.\n\nO contato já aconteceu? Toque no link:\n\n🔗 Sim, já falamos\n${url1}\n\n🔗 Ainda não consegui\n${url2}\n\n🔗 Match não faz mais sentido\n${url3}\n\n_Cada link funciona uma única vez._`
        } else if (currentStatus === 'contact') {
          text = `${prefix}match com *${firstNamePartner}* (${propertyType} · ${propertyRegion}) em Contato.\n\nComo está o andamento?\n\n🔗 Visita agendada ou realizada\n${url1}\n\n🔗 Em conversa, sem visita ainda\n${url2}\n\n🔗 Cliente perdeu interesse\n${url3}\n\n_Cada link funciona uma única vez._`
        } else if (currentStatus === 'visit') {
          text = `${prefix}match com *${firstNamePartner}* (${propertyType} · ${propertyRegion}) em Visita.\n\nHouve proposta?\n\n🔗 Sim, proposta enviada\n${url1}\n\n🔗 Visita foi bem, mas sem proposta ainda\n${url2}\n\n🔗 Negociação encerrada\n${url3}\n\n_Cada link funciona uma única vez._`
        } else if (currentStatus === 'proposal') {
          text = `${prefix}match com *${firstNamePartner}* (${propertyType} · ${propertyRegion}) com proposta aberta.\n\nComo está?\n\n🔗 Negócio fechado! 🎉\n${url1}\n\n🔗 Em negociação ainda\n${url2}\n\n🔗 Proposta recusada\n${url3}\n\n_Cada link funciona uma única vez._`
        }

        if (text) {
          await supabase.functions.invoke('send-whatsapp', {
            body: { number: me.whatsapp_number, text, user_id: me.id },
          })
        }
      }

      await supabase
        .from('partnerships')
        .update({
          last_status_check_at: new Date().toISOString(),
          status_check_count: (p.status_check_count || 0) + 1,
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
