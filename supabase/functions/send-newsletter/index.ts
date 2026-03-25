import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { newsletter_id } = await req.json()
    if (!newsletter_id) throw new Error('newsletter_id required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: nl, error: nlErr } = await supabase.from('newsletters').select('*').eq('id', newsletter_id).single()
    if (nlErr || !nl) throw new Error('Newsletter not found')
    
    if (nl.status === 'sent') return new Response(JSON.stringify({ message: 'Already sent' }), { headers: corsHeaders })

    // Busca todos os usuários ativos
    const { data: users, error: uErr } = await supabase.from('profiles').select('id, full_name, email, whatsapp_number').eq('status', 'active')
    if (uErr || !users) throw new Error('Failed to fetch users')

    let sentCount = 0;

    for (const user of users) {
      if (!user.email) continue;
      
      const firstName = user.full_name ? user.full_name.split(' ')[0] : 'Parceiro';
      
      let htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
          <h2 style="color: #111;">Olá ${firstName},</h2>
          <p>Uma nova edição da nossa Newsletter está disponível para você.</p>
          <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #C9A84C; margin: 20px 0;">
            ${nl.content ? nl.content.replace(/\n/g, '<br/>') : ''}
          </div>
      `;

      if (nl.attachment_url) {
        htmlBody += `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${nl.attachment_url}" style="display:inline-block;padding:14px 28px;background:#C9A84C;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Baixar / Acessar Material</a>
          </div>
        `;
      }

      htmlBody += `
          <p style="color: #666; font-size: 14px; margin-top: 32px;">
            Atenciosamente,<br/>
            <strong>Equipe Prime Circle</strong>
          </p>
        </div>
      `;

      // Envia email
      await supabase.functions.invoke('send-email', {
         body: { to: user.email, subject: nl.title, text: htmlBody, user_id: user.id }
      }).catch(console.error)

      // Envia WhatsApp resumido
      if (user.whatsapp_number) {
        const waMsg = `Olá ${firstName}! 🗞️ A nova edição da Newsletter da Prime Circle acabou de sair: *${nl.title}*.\n\nEnviamos os detalhes e resumos para o seu e-mail. Não deixe de conferir!\n\n${nl.attachment_url ? `🔗 Acesse o material de mercado direto aqui: ${nl.attachment_url}` : ''}`
        await supabase.functions.invoke('send-whatsapp', {
           body: { number: user.whatsapp_number, text: waMsg, user_id: user.id }
        }).catch(console.error)
      }

      sentCount++;
    }

    // Atualiza status para enviado
    await supabase.from('newsletters').update({ status: 'sent', scheduled_at: new Date().toISOString() }).eq('id', newsletter_id)

    return new Response(JSON.stringify({ success: true, sent: sentCount }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders })
  }
})
