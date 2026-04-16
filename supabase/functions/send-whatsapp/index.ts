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
      return new Response(JSON.stringify({ success: false, error: 'Missing number or text' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const instanceId = (Deno.env.get('ZAPI_INSTANCE_ID') || '').trim()
    const token = (Deno.env.get('ZAPI_TOKEN') || '').trim()
    const clientToken = (Deno.env.get('ZAPI_CLIENT_TOKEN') || '').trim()

    if (!instanceId || !token) {
      console.error('Server configuration error: Missing ZAPI_INSTANCE_ID or ZAPI_TOKEN')
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'Configuração pendente: Adicione as variáveis ZAPI_INSTANCE_ID e ZAPI_TOKEN nos Secrets do Supabase.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    let formattedNumber = number.replace(/\D/g, '')
    // WhatsApp format logic for Brazil
    if (formattedNumber.length >= 10 && formattedNumber.length <= 11) {
      formattedNumber = '55' + formattedNumber
    }

    const zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`

    // Support robust text structure for Z-api compatibility
    const payload = {
      phone: formattedNumber,
      message: text,
    }

    let success = false
    let responseText = ''
    let data: any = null
    let response: any = null

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (clientToken) {
        headers['Client-Token'] = clientToken
      }

      response = await fetch(zapiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      responseText = await response.text()
      data = { raw: responseText }
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        // Ignored if not JSON
      }

      success = response.ok && !data.error && !data.error_description
    } catch (e: any) {
      // Network error
      data = { error: e.message }
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
          p_error_details: success
            ? null
            : JSON.stringify({
                status: response?.status,
                endpoint: zapiUrl
                  .replace(token, 'HIDDEN_TOKEN')
                  .replace(instanceId, 'HIDDEN_INSTANCE'),
                apiResponse: data,
              }),
        })
      }
    }

    if (!success) {
      const errorMsg =
        data?.error ||
        data?.message ||
        data?.error_description ||
        (data?.raw ? data.raw.trim() : JSON.stringify(data))
      return new Response(
        JSON.stringify({
          success: false,
          error: `Z-api Erro: ${response?.status || 'Network Error'} - ${errorMsg}`,
          data,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(JSON.stringify({ success, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
