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

    const { token, status_alvo, corretor_id, apenas_validar, vgv } = await req.json()

    if (!token || !status_alvo || !corretor_id) {
      return new Response(JSON.stringify({ valido: false, motivo: 'invalido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: tokenRecord, error: tokenError } = await supabase
      .from('quick_action_tokens')
      .select('*, partnerships(*)')
      .eq('token', token)
      .single()

    if (tokenError || !tokenRecord) {
      return new Response(JSON.stringify({ valido: false, motivo: 'invalido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date()
    const expiresAt = new Date(tokenRecord.expires_at)

    if (tokenRecord.used) {
      return new Response(JSON.stringify({ valido: false, motivo: 'ja_usado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (expiresAt < now) {
      return new Response(JSON.stringify({ valido: false, motivo: 'expirado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (tokenRecord.corretor_id !== corretor_id) {
      return new Response(JSON.stringify({ valido: false, motivo: 'invalido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const partnership = tokenRecord.partnerships
    const action = tokenRecord.action

    const isPropertyMine = partnership.broker_property_id === corretor_id
    const partnerId = isPropertyMine ? partnership.broker_demand_id : partnership.broker_property_id

    const [{ data: partnerProfile }, { data: propertyDoc }, { data: corretorProfile }] =
      await Promise.all([
        supabase.from('profiles').select('full_name, whatsapp_number').eq('id', partnerId).single(),
        supabase.from('documents').select('metadata').eq('id', partnership.property_id).single(),
        supabase.from('profiles').select('full_name').eq('id', corretor_id).single(),
      ])

    if (apenas_validar) {
      return new Response(
        JSON.stringify({
          valido: true,
          dados: {
            nome_parceiro: partnerProfile?.full_name || 'Parceiro',
            tipo_imovel: propertyDoc?.metadata?.tipo_imovel || 'Imóvel',
            bairro_imovel: propertyDoc?.metadata?.bairro || propertyDoc?.metadata?.region || '',
            status_atual: partnership.status,
            status_alvo: tokenRecord.status_alvo,
            action: tokenRecord.action,
            partnership_id: partnership.id,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // PASSO A - Invalidar todos os tokens desta "rodada" (mesma hora)
    const createdHourStart = new Date(tokenRecord.created_at)
    createdHourStart.setMinutes(0, 0, 0, 0)
    const createdHourEnd = new Date(tokenRecord.created_at)
    createdHourEnd.setMinutes(59, 59, 999)

    await supabase
      .from('quick_action_tokens')
      .update({ used: true })
      .eq('partnership_id', partnership.id)
      .gte('created_at', createdHourStart.toISOString())
      .lte('created_at', createdHourEnd.toISOString())

    // PASSO B - Executar por action
    let novo_status = partnership.status
    let pontos_ganhos = 0

    if (action === 1) {
      // Avançar
      if (status_alvo !== 'aguardando_vgv') {
        await supabase
          .from('partnerships')
          .update({
            status: status_alvo,
            confirmed_by_partner: false,
            updated_at: new Date().toISOString(),
            last_interaction_at: new Date().toISOString(),
          })
          .eq('id', partnership.id)

        const { data: pf } = await supabase
          .from('profiles')
          .select('reputation_score')
          .eq('id', corretor_id)
          .single()
        if (pf) {
          await supabase
            .from('profiles')
            .update({ reputation_score: (pf.reputation_score || 0) + 2 })
            .eq('id', corretor_id)
        }
        pontos_ganhos = 2
        novo_status = status_alvo

        if (partnerProfile?.whatsapp_number) {
          const msg = `Broker ${corretorProfile?.full_name || 'Parceiro'} avançou a negociação do imóvel ${propertyDoc?.metadata?.tipo_imovel || 'Imóvel'} para o status *${status_alvo.toUpperCase()}*. Acesse seu painel para confirmar: https://www.primecircle.app.br/dashboard`
          await supabase.functions.invoke('send-whatsapp', {
            body: { number: partnerProfile.whatsapp_number, text: msg, user_id: partnerId },
          })
        }
      } else {
        // status_alvo == 'aguardando_vgv'
        await supabase
          .from('partnerships')
          .update({
            status: 'aguardando_vgv',
            vgv_confirmado_a: vgv,
            updated_at: new Date().toISOString(),
            last_interaction_at: new Date().toISOString(),
          })
          .eq('id', partnership.id)

        const { data: pf } = await supabase
          .from('profiles')
          .select('reputation_score')
          .eq('id', corretor_id)
          .single()
        if (pf) {
          await supabase
            .from('profiles')
            .update({ reputation_score: (pf.reputation_score || 0) + 2 })
            .eq('id', corretor_id)
        }
        pontos_ganhos = 2
        novo_status = 'aguardando_vgv'

        if (partnerProfile?.whatsapp_number) {
          const formattedVgv = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(vgv || 0)
          const msg = `Broker ${corretorProfile?.full_name || 'Parceiro'} informou o fechamento (VGV: ${formattedVgv}) do imóvel ${propertyDoc?.metadata?.tipo_imovel || 'Imóvel'}. Confirme o valor no seu painel para validar o fechamento: https://www.primecircle.app.br/dashboard`
          await supabase.functions.invoke('send-whatsapp', {
            body: { number: partnerProfile.whatsapp_number, text: msg, user_id: partnerId },
          })
        }
      }
    } else if (action === 2) {
      // Manter
      await supabase
        .from('partnerships')
        .update({
          last_status_check_at: new Date().toISOString(),
        })
        .eq('id', partnership.id)
    } else if (action === 3) {
      // Encerrar
      await supabase
        .from('partnerships')
        .update({
          status: 'cancelado',
          cancelado_by: corretor_id,
          updated_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString(),
        })
        .eq('id', partnership.id)
      novo_status = 'cancelado'

      if (partnerProfile?.whatsapp_number) {
        const msg = `O match do imóvel ${propertyDoc?.metadata?.tipo_imovel || 'Imóvel'} foi encerrado por ${corretorProfile?.full_name || 'Parceiro'}. Fique de olho no painel para novas oportunidades!`
        await supabase.functions.invoke('send-whatsapp', {
          body: { number: partnerProfile.whatsapp_number, text: msg, user_id: partnerId },
        })
      }
    }

    // PASSO C - Retornar
    return new Response(
      JSON.stringify({
        sucesso: true,
        novo_status,
        partnership_id: partnership.id,
        pontos_ganhos,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ valido: false, motivo: 'erro_interno', error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
