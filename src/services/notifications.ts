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
      ? 'Assunto: Novo Match Identificado! 🏠 \n\nOlá {{partner_name}},\n\nIdentificamos uma nova oportunidade de negócio! Um novo match foi gerado para o imóvel {{property_details}}.\n\nClique no link abaixo para ver os detalhes e entrar em contato:\n[Link do Sistema]\n\nBoas vendas,\nEquipe Prime Circle'
      : 'Assunto: Você tem uma nova solicitação de parceria 🤝\n\nOlá {{partner_name}},\n\nUm colega de profissão enviou uma solicitação de parceria para você através da Prime Circle.\n\nParcerias aumentam suas chances de fechamento! Acesse seu dashboard para revisar a solicitação.\n\nAtenciosamente,\nEquipe Prime Circle'

  const buildMessage = (content: string) => {
    return content
      .replace(/\{\{partner_name\}\}/g, partnerName)
      .replace(/\{\{property_details\}\}/g, propertyDetails)
  }

  const waMessage = buildMessage(waTemplate ? waTemplate.content : defaultWaContent)
  let waSuccess = false
  let waError = ''

  try {
    const res = await sendWhatsappMessage(recipientPhone, waMessage)
    if (res.error) throw new Error(res.error.message || 'Unknown error')
    if (res.data?.error) throw new Error(res.data.error)
    waSuccess = true
  } catch (err: any) {
    waError = err.message
  }

  await supabase.from('notification_logs').insert({
    user_id: userId,
    recipient: recipientPhone,
    channel: 'whatsapp',
    status: waSuccess ? 'success' : 'failed',
    message_body: waMessage,
    error_details: waError || null,
  })

  if (!waSuccess) {
    const emailMessage = buildMessage(emailTemplate ? emailTemplate.content : defaultEmailContent)
    let emailSuccess = false
    let emailError = ''

    try {
      await sendTransactionalEmail(type === 'match' ? 'match_fallback' : 'partnership_fallback', {
        to: recipientEmail,
        body: emailMessage,
      })
      emailSuccess = true
    } catch (err: any) {
      emailError = err.message
    }

    await supabase.from('notification_logs').insert({
      user_id: userId,
      recipient: recipientEmail,
      channel: 'email',
      status: emailSuccess ? 'success' : 'failed',
      message_body: emailMessage,
      error_details: emailError || null,
    })
  }
}
