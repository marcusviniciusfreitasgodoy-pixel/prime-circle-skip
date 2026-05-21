import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { user_id, plan_id } = body;

    if (!user_id || !plan_id) {
      return new Response(JSON.stringify({ error: 'user_id and plan_id are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 1. Get Plan Details
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !planData) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const price_base = parseFloat(planData.price_base);
    
    // 2. Get User Matches for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const { data: matchData, error: matchError } = await supabase
      .from('user_matches')
      .select('match_count')
      .eq('user_id', user_id)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .maybeSingle();

    const matches_this_month = matchData?.match_count || 0;

    // 3. Calculate Dynamic Discount
    let discount_percentage = 0;
    if (matches_this_month >= 20) {
      discount_percentage = 30; // 30% off for 20+ matches
    } else if (matches_this_month >= 10) {
      discount_percentage = 20; // 20% off for 10+ matches
    }

    // Free plan or baseline ignores discount mathematically
    let final_price = price_base;
    if (price_base > 0 && discount_percentage > 0) {
      final_price = price_base * (1 - discount_percentage / 100);
    }

    // 4. Return formatted response matching Acceptance Criteria
    const responseData = {
      plan_id,
      price_base,
      discount_percentage,
      final_price: parseFloat(final_price.toFixed(2)),
      matches_this_month,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
