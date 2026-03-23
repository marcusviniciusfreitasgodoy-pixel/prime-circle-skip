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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { token, status_alvo, corretor_id, apenas_validar } = await req.json()

    if (!token || !status_alvo || !corretor_id) {
      return new Response(JSON.stringify({ valido: false, error: 'Missing parameters' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: tokenRecord, error: tokenError } = await supabase
      .from('quick_action_tokens')
      .select('*, partnerships(*)')
      .eq('token', token)
      .single()

    if (tokenError || !tokenRecord) {
      return new Response(JSON.stringify({ valido: false, error: 'Token not found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const now = new Date()
    const expiresAt = new Date(tokenRecord.expires_at)
    
    if (tokenRecord.used || expiresAt < now || tokenRecord.corretor_id !== corretor_id || tokenRecord.status_alvo !== status_alvo) {
      return new Response(JSON.stringify({ valido: false, error: 'Token invalid or expired' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (apenas_validar) {
      return new Response(JSON.stringify({ valido: true, partnership: tokenRecord.partnerships }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Mark token as used
    await supabase.from('quick_action_tokens').update({ used: true }).eq('id', tokenRecord.id)

    // Reset check metrics on partnership
    await supabase.from('partnerships').update({
      status_check_failed: false,
      status_check_count: 0
    }).eq('id', tokenRecord.partnership_id)

    // Call existing RPC to handle reputação & partner notifications safely
    await supabase.rpc('quick_update_partnership', { 
      p_token: tokenRecord.partnerships.update_token, 
      p_status: status_alvo, 
      p_broker_id: corretor_id 
    })

    return new Response(JSON.stringify({ valido: true, success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    return new Response(JSON.stringify({ valido: false, error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
