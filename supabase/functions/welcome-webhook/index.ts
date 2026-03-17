import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json()
    const profile = payload.record

    if (!profile || !profile.id) {
      return new Response('No valid record found', { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    await new Promise((res) => setTimeout(res, 2000))

    const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
    const email = userData?.user?.email

    const fullName = profile.full_name || 'Corretor'
    const recipientPhone = profile.whatsapp_number
    const recipientEmail = email

    if (!recipientEmail) {
      return new Response('No email available for user', { status: 400 })
    }

    const { data: templates } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('user_id', profile.id)

    let waTemplate = templates?.find((t) => t.name === 'Boas-vindas - WhatsApp')
    let emailTemplate = templates?.find((t) => t.name === 'Boas-vindas - Email')

    if (!waTemplate || !emailTemplate) {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single()

      if (adminProfile) {
        const { data: adminTemplates } = await supabase
          .from('notification_templates')
          .select('*')
          .eq('user_id', adminProfile.id)
        if (!waTemplate)
          waTemplate = adminTemplates?.find((t) => t.name === 'Boas-vindas - WhatsApp')
        if (!emailTemplate)
          emailTemplate = adminTemplates?.find((t) => t.name === 'Boas-vindas - Email')
      }
    }

    const defaultWaContent =
      'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias. Em breve entraremos em contato!'
    const defaultEmailContent =
      'Assunto: Bem-vindo à Prime Circle! 🏠\n\nOlá {{full_name}},\n\nÉ um prazer ter você conosco! Sua conta foi criada com sucesso. Agora você faz parte de um ecossistema exclusivo projetado para potencializar seus resultados no mercado imobiliário.\n\nAcesse seu painel agora para completar seu perfil e começar a gerar matches.\n\nBoas vendas,\nEquipe Prime Circle'

    const buildMessage = (content: string) => content.replace(/\{\{full_name\}\}/g, fullName)

    const waMessage = buildMessage(waTemplate ? waTemplate.content : defaultWaContent)
    const emailMessage = buildMessage(emailTemplate ? emailTemplate.content : defaultEmailContent)

    if (recipientPhone) {
      await supabase.functions.invoke('send-whatsapp', {
        body: { number: recipientPhone, text: waMessage, user_id: profile.id },
      })
    }

    let subject = 'Bem-vindo à Prime Circle! 🏠'
    let bodyText = emailMessage
    const match = bodyText.match(/^Assunto:\s*(.+)\n+([\s\S]*)$/i)
    if (match) {
      subject = match[1].trim()
      bodyText = match[2].trim()
    }

    await supabase.functions.invoke('send-email', {
      body: { to: recipientEmail, subject, text: bodyText, user_id: profile.id },
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
