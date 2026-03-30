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
    const { number, text, user_id } = await req.json()

    if (!number || !text) {
      return new Response(JSON.stringify({ success: false, error: 'Missing number or text' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiUrl = Deno.env.get('EVOLUTION_API_URL') || 'https://evo2.godoyprime.shop'
    const apiKey = Deno.env.get('EVOLUTION_API_KEY')
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'GodoyPrimeImoveis'

    if (!apiKey) {
      console.error('Server configuration error: Missing EVOLUTION_API_KEY')
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let formattedNumber = number.replace(/\D/g, '')
    // WhatsApp format logic for Brazil
    if (formattedNumber.length >= 10 && formattedNumber.length <= 11) {
      formattedNumber = '55' + formattedNumber
    }

    const endpoint = `${apiUrl}/message/sendText/${instanceName}`
    
    // Support robust text structure for Evolution API compatibility
    const payload = {
      number: formattedNumber,
      text: text,
      textMessage: {
        text: text
      },
      options: {
        delay: 1200,
        presence: "composing",
        linkPreview: false
      }
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    const responseText = await response.text()
    let data: any = { raw: responseText }
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      // Ignored if not JSON
    }

    const success = response.ok && !data.error && data.status !== 'ERROR'

    // Log the notification with robust data logging
    if (user_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase.rpc('log_notification', {
          p_user_id: user_id,
          p_recipient: formattedNumber,
          p_channel: 'whatsapp',
          p_status: success ? 'success' : 'failed',
          p_message_body: text,
          p_error_details: success ? null : JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            apiResponse: data
          }),
        })
      }
    }

    return new Response(JSON.stringify({ success, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
