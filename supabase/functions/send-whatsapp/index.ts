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
    const { number, text, user_id } = await req.json()

    if (!number || !text) {
      return new Response(JSON.stringify({ error: 'Missing number or text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiUrl = Deno.env.get('EVOLUTION_API_URL') || 'https://evo2.godoyprime.shop'
    const apiKey = Deno.env.get('EVOLUTION_API_KEY')
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'GodoyPrimeImoveis'

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const endpoint = `${apiUrl}/message/sendText/${instanceName}`

    const payload = {
      number,
      text,
      options: {
        delay: 1200,
        presence: 'composing',
      },
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    const success = response.ok && !data.error

    if (user_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase.rpc('log_notification', {
          p_user_id: user_id,
          p_recipient: number,
          p_channel: 'whatsapp',
          p_status: success ? 'success' : 'failed',
          p_message_body: text,
          p_error_details: success ? null : JSON.stringify(data),
        })
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
