import { supabase } from '@/lib/supabase/client'

export const sendWhatsappMessage = async (number: string, text: string) => {
  const { data, error } = await supabase.functions.invoke('send-whatsapp', {
    body: { number, text },
  })
  return { data, error }
}
