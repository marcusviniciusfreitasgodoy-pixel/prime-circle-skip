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

    const rawApiUrl = (Deno.env.get('EVOLUTION_API_URL') || 'https://evo2.godoyprime.shop').trim()
    const apiUrl = rawApiUrl.replace(/\/+$/, '')
    const apiKey = (Deno.env.get('EVOLUTION_API_KEY') || '').trim()
    const rawInstanceName = (Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'GodoyPrimeImoveis').trim()
    const instanceName = encodeURIComponent(rawInstanceName)

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
    
    const endpointsToTry = []
    if (apiUrl.includes('/message/sendText')) {
      endpointsToTry.push(apiUrl)
    } else {
      endpointsToTry.push(`${apiUrl}/message/sendText/${instanceName}`)
      if (apiUrl.includes('evo2.godoyprime.shop')) {
        // Fallback for known subdomain migrations
        endpointsToTry.push(`https://evo.godoyprime.shop/message/sendText/${instanceName}`)
        endpointsToTry.push(`https://api.godoyprime.shop/message/sendText/${instanceName}`)
      }
    }
    
    let success = false
    let responseText = ''
    let data: any = null
    let response: any = null
    let finalEndpoint = ''

    for (const endpoint of endpointsToTry) {
      finalEndpoint = endpoint
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        })

        responseText = await response.text()
        data = { raw: responseText }
        try {
          data = JSON.parse(responseText)
        } catch (e) {
          // Ignored if not JSON
        }

        success = response.ok && !data.error && data.status !== 'ERROR'
        
        // If it succeeded, or if it failed with something OTHER than a 404/502 proxy error, we stop trying.
        // A generic 404 HTML/text page means the Evolution API router didn't catch it on this URL.
        if (success || (response.status !== 404 && response.status !== 502 && response.status !== 503)) {
          break
        }
      } catch (e) {
        // Network error, try next
      }
    }

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
            status: response?.status,
            endpoint: finalEndpoint,
            apiResponse: data
          }),
        })
      }
    }

    if (!success) {
      const errorMsg = data?.error || data?.message || (data?.raw ? data.raw.trim() : JSON.stringify(data))
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Evolution API Erro: ${response?.status || 'Network Error'} - ${errorMsg} (Endpoint: ${finalEndpoint})`,
        data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
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
