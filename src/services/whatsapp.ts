import { supabase } from '@/lib/supabase/client'

export const sendWhatsappMessage = async (number: string, text: string, userId?: string) => {
  const { data, error } = await supabase.functions.invoke('send-whatsapp', {
    body: { number, text, user_id: userId },
  })

  if (error) {
    throw error
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}
