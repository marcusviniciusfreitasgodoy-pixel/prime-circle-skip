import { supabase } from '@/lib/supabase/client'
import { sendWhatsappMessage } from '@/services/whatsapp'
import { sendTransactionalEmail } from '@/lib/email'

export type NotificationTemplate = {
  id: string
  user_id: string
  name: string
  content: string
  channel: 'whatsapp' | 'email'
  created_at: string
}

export type NotificationLog = {
  id: string
  user_id: string
  recipient: string
  channel: 'whatsapp' | 'email'
  status: 'success' | 'failed'
  message_body: string
  error_details: string | null
  created_at: string
}

export const fetchTemplates = async (userId: string) => {
  const { data, error } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data as NotificationTemplate[] | null, error }
}

export const saveTemplate = async (userId: string, template: Partial<NotificationTemplate>) => {
  if (template.id) {
    return supabase
      .from('notification_templates')
      .update({
        name: template.name,
        content: template.content,
        channel: template.channel,
      })
      .eq('id', template.id)
      .eq('user_id', userId)
  } else {
    return supabase.from('notification_templates').insert({
      user_id: userId,
      name: template.name!,
      content: template.content!,
      channel: template.channel!,
    })
  }
}

export const deleteTemplate = async (id: string, userId: string) => {
  return supabase.from('notification_templates').delete().eq('id', id).eq('user_id', userId)
}

export const fetchLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from('notification_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data as NotificationLog[] | null, error }
}

export const processNotification = async ({
  userId,
  type,
  partnerName,
  propertyDetails,
  recipientPhone,
  recipientEmail,
}: {
  userId: string
  type: 'match' | 'partnership'
  partnerName: string
  propertyDetails: string
  recipientPhone: string
  recipientEmail: string
}) => {
  const { data: templates } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('user_id', userId)

  const waTemplateName =
    type === 'match' ? 'Notificação de Match - WhatsApp' : 'Solicitação de Parceria - WhatsApp'
  const emailTemplateName =
    type === 'match' ? 'Notificação de Match - Email' : 'Solicitação de Parceria - Email'

  const waTemplate = templates?.find((t) => t.name === waTemplateName)
  const emailTemplate = templates?.find((t) => t.name === emailTemplateName)

  const defaultWaContent =
    type === 'match'
      ? 'Olá {{partner_name}}! 🚀 Acabamos de encontrar um novo match para o imóvel {{property_details}}. Confira agora mesmo no seu painel da Prime Circle!'
      : 'Olá {{partner_name}}! Você recebeu uma nova solicitação de parceria na Prime Circle. Acesse a plataforma para responder e iniciar essa nova colaboração. 🤝'

  const defaultEmailContent =
    type === 'match'
      ? 'Assunto: Novo Match Identificado! 🏠 \n\nOlá {{partner_name}},\n\nIdentificamos uma nova oportunidade de negócio! Um novo match foi gerado para o imóvel {{property_details}}.\n\nClique no link abaixo para ver os detalhes e entrar em contato:\nhttps://www.primecircle.app.br/dashboard\n\nBoas vendas,\nEquipe Prime Circle'
      : 'Assunto: Você tem uma nova solicitação de parceria 🤝\n\nOlá {{partner_name}},\n\nUm colega de profissão enviou uma solicitação de parceria para você através da Prime Circle.\n\nParcerias aumentam suas chances de fechamento! Acesse seu dashboard para revisar a solicitação.\n\nAtenciosamente,\nEquipe Prime Circle'

  const buildMessage = (content: string) => {
    return content
      .replace(/\{\{partner_name\}\}/g, partnerName)
      .replace(/\{\{property_details\}\}/g, propertyDetails)
      .replace(/\[Link do Sistema\]/g, 'https://www.primecircle.app.br/dashboard')
  }

  const waMessage = buildMessage(waTemplate ? waTemplate.content : defaultWaContent)
  const emailMessage = buildMessage(emailTemplate ? emailTemplate.content : defaultEmailContent)

  const notificationPromises = []

  if (recipientPhone) {
    notificationPromises.push(
      sendWhatsappMessage(recipientPhone, waMessage, userId).then((res) => {
        if (res?.error) throw new Error(res.error)
      }),
    )
  }

  if (recipientEmail) {
    notificationPromises.push(
      sendTransactionalEmail(type === 'match' ? 'match_notification' : 'partnership_notification', {
        to: recipientEmail,
        body: emailMessage,
        userId,
      }).then((res) => {
        if (res?.error || res?.success === false) throw new Error(res?.error || 'Email error')
      }),
    )
  }

  if (notificationPromises.length === 0) {
    return { success: false, partial: false }
  }

  const results = await Promise.allSettled(notificationPromises)
  const failed = results.filter((r) => r.status === 'rejected')
  const succeeded = results.filter((r) => r.status === 'fulfilled')

  if (failed.length > 0 && succeeded.length === 0) {
    throw new Error('Falha ao enviar notificações. Verifique os contatos.')
  }

  return {
    success: succeeded.length > 0,
    partial: failed.length > 0 && succeeded.length > 0,
  }
}

export const sendWelcomeNotifications = async ({
  userId,
  fullName,
  recipientPhone,
  recipientEmail,
}: {
  userId: string
  fullName: string
  recipientPhone: string
  recipientEmail: string
}) => {
  const { data: templates } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('user_id', userId)

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

      if (!waTemplate) {
        waTemplate = adminTemplates?.find((t) => t.name === 'Boas-vindas - WhatsApp')
      }
      if (!emailTemplate) {
        emailTemplate = adminTemplates?.find((t) => t.name === 'Boas-vindas - Email')
      }
    }
  }

  const defaultWaContent =
    'Olá {{full_name}}! 🚀 Bem-vindo à Prime Circle. Seu cadastro foi recebido com sucesso. Estamos muito felizes em ter você em nossa rede exclusiva de parcerias imobiliárias.'
  const defaultEmailContent =
    'Assunto: Bem-vindo à Prime Circle! 🏠\n\nOlá {{full_name}},\n\nBem-vindo à Prime Circle! Agora que sua conta foi criada, utilize o link abaixo para acessar seu painel exclusivo e começar a gerar parcerias.\n\nAcesse: https://prime-circle-migration-fd549.goskip.app/dashboard\n\nBoas vendas,\nEquipe Prime Circle'

  const buildMessage = (content: string) => {
    return content.replace(/\{\{full_name\}\}/g, fullName)
  }

  const waMessage = buildMessage(waTemplate ? waTemplate.content : defaultWaContent)
  try {
    await sendWhatsappMessage(recipientPhone, waMessage, userId)
  } catch (err: any) {
    console.error('Welcome WA Error:', err)
  }

  const emailMessage = buildMessage(emailTemplate ? emailTemplate.content : defaultEmailContent)
  try {
    await sendTransactionalEmail('welcome_email', {
      to: recipientEmail,
      body: emailMessage,
      userId,
    })
  } catch (err: any) {
    console.error('Welcome Email Error:', err)
  }
}
