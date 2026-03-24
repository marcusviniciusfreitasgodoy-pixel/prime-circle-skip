import { supabase } from '@/lib/supabase/client'

export const sendTransactionalEmail = async (type: string, payload: any) => {
  let subject = payload.subject || 'Notificação Prime Circle'
  let bodyText = payload.body || ''

  const match = bodyText.match(/^Assunto:\s*(.+)\n+([\s\S]*)$/i)
  if (match) {
    subject = match[1].trim()
    bodyText = match[2].trim()
  }

  if (type === 'welcome_email') {
    subject = payload.subject || subject || 'Bem-vindo à Prime Circle! 🏠'
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: payload.to,
        subject,
        text: bodyText,
        user_id: payload.userId,
      },
    })

    if (error) {
      console.error('Error invoking send-email edge function:', error)
      throw error
    }

    if (data?.error) {
      throw new Error(data.error)
    }

    return data
  } catch (error) {
    console.error('Email send failed:', error)
    throw error
  }
}

export const simulateBiWeeklyReview = () => {
  // Intentionally silent
}
