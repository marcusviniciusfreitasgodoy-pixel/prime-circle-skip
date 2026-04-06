import { supabase } from '@/lib/supabase/client'

export const sendWhatsappMessage = async (number: string, text: string, userId?: string) => {
  const { data, error } = await supabase.functions.invoke('send-whatsapp', {
    body: { number, text, user_id: userId },
  })

  if (error) {
    throw error
  }

  if (data?.error) {
    const errMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
    throw new Error(errMsg)
  }

  if (data?.success === false) {
    throw new Error('Falha no envio da notificação via WhatsApp')
  }

  return data
}
