import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // We want expires_at to be exactly 60 days from now.
    const today = new Date()
    const targetDateStart = new Date(today)
    targetDateStart.setDate(targetDateStart.getDate() + 60)
    targetDateStart.setHours(0, 0, 0, 0)

    const targetDateEnd = new Date(targetDateStart)
    targetDateEnd.setDate(targetDateEnd.getDate() + 1)

    const { data: userPlans, error: plansError } = await supabase
      .from('user_plans')
      .select(`
        user_id, 
        expires_at, 
        profiles (
          full_name, 
          email
        )
      `)
      .eq('is_founder', true)
      .eq('status', 'active')
      .gte('expires_at', targetDateStart.toISOString())
      .lt('expires_at', targetDateEnd.toISOString())

    if (plansError) {
      throw plansError
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const results = []

    for (const plan of userPlans || []) {
      const profile = Array.isArray(plan.profiles) ? plan.profiles[0] : plan.profiles
      const email = profile?.email
      const fullName = profile?.full_name || 'Founder'

      if (!email) continue

      const subject = 'Seu período grátis expira em 60 dias'
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
          <h2 style="color: #111;">Olá ${fullName},</h2>
          <p>Gostaríamos de lembrar que o seu período gratuito como membro Founder do Prime Circle expira em exatos 60 dias.</p>
          <p>Como um de nossos membros pioneiros, você tem o direito ao custo fixo permanente de <strong>R$ 47/mês</strong>.</p>
          
          <h3 style="color: #C9A84C; margin-top: 24px;">Seus Benefícios Exclusivos:</h3>
          <ul style="background: #f9f9f9; padding: 16px 32px; border-radius: 8px;">
            <li style="margin-bottom: 8px;"><strong>Badge Founder:</strong> Selo de destaque exclusivo na plataforma.</li>
            <li style="margin-bottom: 8px;"><strong>Voto em Produto:</strong> Poder de decisão sobre o roadmap e novas funcionalidades.</li>
            <li><strong>Acesso Ilimitado:</strong> Demandas, imóveis e conexões sem restrições.</li>
          </ul>
          
          <h3 style="color: #C9A84C; margin-top: 24px;">Oferta Especial de Renovação</h3>
          <p>Garanta sua permanência com uma condição exclusiva: <strong>Pague 3 meses, ganhe 1 grátis</strong>.</p>
          <p>Isso significa 4 meses de acesso ilimitado por apenas <strong>R$ 141</strong>.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://www.primecircle.app.br/plans" style="display: inline-block; padding: 14px 28px; background-color: #C9A84C; color: #000; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">Ver Planos e Renovar</a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 32px;">
            Atenciosamente,<br/>
            <strong>Equipe Prime Circle</strong>
          </p>
        </div>
      `

      let success = false
      let errorDetails = null

      if (resendApiKey) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Prime Circle <contato@primecircle.app.br>',
              to: email,
              subject: subject,
              html: htmlBody,
            }),
          })

          const data = await res.json()
          success = res.ok
          if (!success) errorDetails = data
          results.push({ email, success, data })
        } catch (e: any) {
          success = false
          errorDetails = e.message
          results.push({ email, success, error: e.message })
        }
      } else {
        // Fallback: use existing send-email function if Resend is not configured locally
        const textBody = htmlBody.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n')
        const res = await supabase.functions.invoke('send-email', {
          body: {
            to: email,
            subject: subject,
            text: textBody,
            user_id: plan.user_id,
          },
        })
        success = !res.error && res.data?.success !== false
        if (!success) errorDetails = res.error || res.data?.error
        results.push({ email, success, data: res.data || res.error })
      }

      // Log notification status
      await supabase.rpc('log_notification', {
        p_user_id: plan.user_id,
        p_recipient: email,
        p_channel: 'email',
        p_status: success ? 'success' : 'failed',
        p_message_body: subject,
        p_error_details: errorDetails ? JSON.stringify(errorDetails) : null,
      })
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
