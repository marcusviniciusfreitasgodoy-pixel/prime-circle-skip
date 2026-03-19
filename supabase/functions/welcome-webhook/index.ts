import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

declare const EdgeRuntime: any;

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json()

    const processWebhook = async (payload: any) => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      try {
        const profile = payload.record
        
        if (!profile || !profile.id) {
          console.error('No valid record found')
          return
        }

        // Delay slightly to ensure DB transactions have fully committed
        await new Promise(res => setTimeout(res, 1000))

        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id)
        if (userError || !userData?.user) {
          console.error('Failed to fetch user auth data:', userError)
          return
        }
        
        const email = userData.user.email
        const fullName = profile.full_name || 'Parceiro(a)'
        const companyName = profile.company_name || 'sua imobiliária'
        const region = profile.region || 'sua região'
        
        // Clean and format WhatsApp number for API
        let recipientPhone = profile.whatsapp_number
        if (recipientPhone) {
          recipientPhone = recipientPhone.replace(/\D/g, '')
          if (recipientPhone.length >= 10 && recipientPhone.length <= 11) {
            recipientPhone = '55' + recipientPhone
          }
        }
        
        const recipientEmail = email

        if (!recipientEmail) {
          console.error('No email available for user')
          return
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
            if (!waTemplate) waTemplate = adminTemplates?.find((t) => t.name === 'Boas-vindas - WhatsApp')
            if (!emailTemplate) emailTemplate = adminTemplates?.find((t) => t.name === 'Boas-vindas - Email')
          }
        }

        const defaultWaContent = 'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias.'
        const defaultEmailContent = 'Assunto: Bem-vindo à Prime Circle! 🏠\n\nOlá {{full_name}},\n\nBem-vindo à Prime Circle! Agora que sua conta foi criada, acesse o nosso Dashboard para começar a gerar parcerias:\nDashboard: https://www.primecircle.app.br/dashboard\n\nCaso precise entrar novamente, você pode solicitar um Magic Link na página de Acesso Exclusivo:\nAcesso Exclusivo: https://www.primecircle.app.br/\n\nBoas vendas,\nEquipe Prime Circle'

        const buildMessage = (content: string) => {
          return content
            .replace(/\{\{full_name\}\}/g, fullName)
            .replace(/\{\{company_name\}\}/g, companyName)
            .replace(/\{\{region\}\}/g, region)
        }

        const waMessage = buildMessage(waTemplate ? waTemplate.content : defaultWaContent)
        const emailMessage = buildMessage(emailTemplate ? emailTemplate.content : defaultEmailContent)

        let subject = 'Bem-vindo à Prime Circle! 🏠'
        let bodyText = emailMessage
        const match = bodyText.match(/^Assunto:\s*(.+)\n+([\s\S]*)$/i)
        if (match) {
          subject = match[1].trim()
          bodyText = match[2].trim()
        }

        const notificationPromises = []

        if (recipientPhone) {
          notificationPromises.push(
            supabase.functions.invoke('send-whatsapp', {
              body: { number: recipientPhone, text: waMessage, user_id: profile.id }
            }).then(res => {
                if (res.error) throw res.error;
                return res;
            }).catch(async (err) => {
                await supabase.rpc('log_notification', {
                    p_user_id: profile.id,
                    p_recipient: recipientPhone,
                    p_channel: 'whatsapp',
                    p_status: 'failed',
                    p_message_body: waMessage,
                    p_error_details: err.message || JSON.stringify(err)
                });
            })
          )
        }

        notificationPromises.push(
          supabase.functions.invoke('send-email', {
            body: { to: recipientEmail, subject, text: bodyText, user_id: profile.id }
          }).then(res => {
              if (res.error) throw res.error;
              return res;
          }).catch(async (err) => {
              await supabase.rpc('log_notification', {
                  p_user_id: profile.id,
                  p_recipient: recipientEmail,
                  p_channel: 'email',
                  p_status: 'failed',
                  p_message_body: bodyText,
                  p_error_details: err.message || JSON.stringify(err)
              });
          })
        )

        await Promise.allSettled(notificationPromises)

      } catch (err: any) {
        console.error('Webhook processing error:', err)
        if (payload?.record?.id) {
           await supabase.rpc('log_notification', {
              p_user_id: payload.record.id,
              p_recipient: 'system',
              p_channel: 'email',
              p_status: 'failed',
              p_message_body: 'Webhook execution failed',
              p_error_details: err.message || JSON.stringify(err)
          });
        }
      }
    }

    if (typeof EdgeRuntime !== 'undefined' && typeof EdgeRuntime.waitUntil === 'function') {
      EdgeRuntime.waitUntil(processWebhook(payload))
    } else {
      processWebhook(payload).catch(console.error)
    }

    return new Response(JSON.stringify({ success: true, message: 'Processing asynchronously' }), { 
      status: 202, 
      headers: { 'Content-Type': 'application/json' } 
    })
  } catch (err: any) {
    console.error('Welcome webhook parse error:', err)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }
})
