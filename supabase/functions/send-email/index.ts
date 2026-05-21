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
    const body = await req.json().catch(() => ({}))
    const { to, subject, text, user_id } = body

    if (!to || !subject || !text) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, text' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    // Replace newlines with <br/> for HTML email if text is plain
    const htmlBody = text.replace(/\n/g, '<br/>')

    let success = false
    let responseData = null

    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Prime Circle <contato@primecircle.app.br>',
          to: to,
          subject: subject,
          html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">${htmlBody}</div>`,
        }),
      })

      const responseText = await res.text()
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        responseData = { message: responseText }
      }
      success = res.ok
    } else {
      // Mock success if no Resend key is available
      success = true
      responseData = { message: 'Mocked email sent (no RESEND_API_KEY provided)' }
    }

    // Log the notification
    if (user_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { error: logError } = await supabase.rpc('log_notification', {
          p_user_id: user_id,
          p_recipient: to,
          p_channel: 'email',
          p_status: success ? 'success' : 'failed',
          p_message_body: subject + '\n' + text,
          p_error_details: success ? null : JSON.stringify(responseData),
        })
        if (logError) console.error('Failed to log notification', logError)
      }
    }

    if (!success) {
      return new Response(JSON.stringify({ success: false, error: responseData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
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
