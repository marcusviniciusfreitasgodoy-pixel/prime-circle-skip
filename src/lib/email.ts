import { supabase } from '@/lib/supabase/client'

export const sendTransactionalEmail = async (type: string, payload: any) => {
  let subject = payload.subject || 'Notificação Prime Circle'
  let bodyText = payload.body || ''

  // Parse subject directly from body if it includes the "Assunto: " prefix
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
      },
    })

    if (error) {
      console.error('Error invoking send-email edge function:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Email send failed (silent fallback):', error)
    return { success: false, error }
  }
}

export const simulateBiWeeklyReview = () => {
  // Intentionally silent
}
