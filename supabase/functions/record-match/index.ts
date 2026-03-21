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

    const body = await req.json()
    const { user_id } = body

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // 1. Insert into user_actions
    await supabase.from('user_actions').insert({
      user_id,
      action_type: 'match_accepted',
    })

    // 2. Increment match_count in user_matches for current month/year
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const { data: match_count, error: rpcError } = await supabase.rpc(
      'increment_user_match_count',
      {
        p_user_id: user_id,
        p_month: currentMonth,
        p_year: currentYear,
      },
    )

    if (rpcError) {
      throw rpcError
    }

    // 3. Calculate discount percentage to return
    let discount_percentage = 0
    if (match_count >= 20) {
      discount_percentage = 30
    } else if (match_count >= 10) {
      discount_percentage = 20
    }

    return new Response(
      JSON.stringify({
        success: true,
        match_count,
        discount_percentage,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
