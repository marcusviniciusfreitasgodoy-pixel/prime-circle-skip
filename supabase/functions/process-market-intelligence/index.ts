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
    const payload = await req.json()
    const record = payload.record

    if (!record || !record.metadata) {
      return new Response(JSON.stringify({ success: true, message: 'No metadata' }), {
        headers: corsHeaders,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (record.metadata.type === 'oferta') {
      let condoId = record.condominium_id
      const condoName = record.metadata.nome_condominio
      const neighborhood = record.metadata.bairro || record.metadata.neighborhood || 'Desconhecido'
      const city = record.metadata.cidade || record.metadata.city || 'Rio de Janeiro'

      // Resolve Condominium connection
      if (!condoId && condoName) {
        const { data: existingCondo } = await supabase
          .from('condominiums')
          .select('id')
          .ilike('name', condoName)
          .maybeSingle()

        if (existingCondo) {
          condoId = existingCondo.id
        } else {
          const { data: newCondo } = await supabase
            .from('condominiums')
            .insert({ name: condoName, neighborhood, city })
            .select('id')
            .maybeSingle()
          if (newCondo) condoId = newCondo.id
        }
      }

      // Calculate Hot Score based on algorithm: 40% Bairro, 30% Tipologia, 30% Preço
      const propBairro = (
        record.metadata.bairro ||
        record.metadata.neighborhood ||
        ''
      ).toLowerCase()
      const propTipo = (record.metadata.tipo_imovel || '').toLowerCase()
      const propValor = Number(record.metadata.valor || 0)

      const { data: demands } = await supabase
        .from('documents')
        .select('id, metadata')
        .contains('metadata', { type: 'demanda' })

      let totalScore = 0
      let matchesCount = 0

      if (demands) {
        for (const demand of demands) {
          const demandBairro = (
            demand.metadata.bairro ||
            demand.metadata.region ||
            ''
          ).toLowerCase()
          const demandTipo = (demand.metadata.tipo_imovel || '').toLowerCase()
          const demandValor = Number(demand.metadata.valor || 0)

          let matchScore = 0
          if (
            demandBairro &&
            propBairro &&
            (propBairro.includes(demandBairro) || demandBairro.includes(propBairro))
          ) {
            matchScore += 0.4
          }
          if (
            demandTipo &&
            propTipo &&
            (propTipo.includes(demandTipo) || demandTipo.includes(propTipo))
          ) {
            matchScore += 0.3
          }
          if (demandValor > 0 && propValor <= demandValor * 1.1) {
            matchScore += 0.3
          }

          if (matchScore >= 0.7) {
            totalScore += matchScore
            matchesCount += 1
          }
        }
      }

      let hotScore = 0
      if (matchesCount > 0) {
        hotScore = Math.min(100, Math.round((totalScore / matchesCount) * 100))
        // Boost score based on number of active potential matches
        hotScore = Math.min(100, hotScore + Math.min(20, matchesCount * 5))
      } else {
        hotScore = 15 // baseline cold score
      }

      // Update the document with processed insights
      await supabase
        .from('documents')
        .update({
          condominium_id: condoId,
          metadata: {
            ...record.metadata,
            hot_score: hotScore,
            potential_matches: matchesCount,
          },
        })
        .eq('id', record.id)
    } else if (record.metadata.type === 'demanda') {
      const demandedCondos = record.metadata.condominiums || []
      const neighborhood = record.metadata.bairro || record.metadata.region || 'Desconhecido'

      // Map demands to condominiums bridging
      for (const condoName of demandedCondos) {
        let condoId
        const { data: existingCondo } = await supabase
          .from('condominiums')
          .select('id')
          .ilike('name', condoName)
          .maybeSingle()

        if (existingCondo) {
          condoId = existingCondo.id
        } else {
          const { data: newCondo } = await supabase
            .from('condominiums')
            .insert({ name: condoName, neighborhood })
            .select('id')
            .maybeSingle()
          if (newCondo) condoId = newCondo.id
        }

        if (condoId) {
          await supabase
            .from('demanda_condominio')
            .insert({
              demand_id: record.id,
              condominium_id: condoId,
              score_compatibilidade: 1.0,
              vinculo_tipo: 'direto',
            })
            .select()
            .maybeSingle()
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
