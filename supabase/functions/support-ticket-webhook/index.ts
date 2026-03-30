import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

declare const EdgeRuntime: any

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json()

    const processWebhook = async (payload: any) => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      try {
        const ticket = payload.record

        if (!ticket || !ticket.id) {
          console.error('No valid record found')
          return
        }

        // Delay slightly to ensure DB transactions have fully committed
        await new Promise((res) => setTimeout(res, 1000))

        const { data: admins, error: adminError } = await supabase
          .from('profiles')
          .select('id, full_name, whatsapp_number')
          .eq('role', 'admin')

        if (adminError || !admins || admins.length === 0) {
          console.error('Failed to fetch admins:', adminError)
          return
        }

        const notificationPromises = []

        for (const admin of admins) {
          const { data: adminAuth } = await supabase.auth.admin.getUserById(admin.id)
          const adminEmail = adminAuth?.user?.email

          const waMessage = `🚀 *Novo Chamado na Prime Circle!*\n\n*De:* ${ticket.full_name}\n*Assunto:* ${ticket.subject}\n*Mensagem:* ${ticket.message}\n\nAcesse o painel para responder.`

          const emailSubject = `[Novo Suporte] ${ticket.subject}`
          const emailBody = `Novo chamado de suporte recebido.\n\nNome: ${ticket.full_name}\nE-mail: ${ticket.email}\nData: ${new Date(ticket.created_at).toLocaleString('pt-BR')}\n\nMensagem:\n${ticket.message}`

          if (admin.whatsapp_number) {
            notificationPromises.push(
              supabase.functions
                .invoke('send-whatsapp', {
                  body: { number: admin.whatsapp_number, text: waMessage, user_id: admin.id },
                })
                .catch(console.error),
            )
          }

          if (adminEmail) {
            notificationPromises.push(
              supabase.functions
                .invoke('send-email', {
                  body: {
                    to: adminEmail,
                    subject: emailSubject,
                    text: emailBody,
                    user_id: admin.id,
                  },
                })
                .catch(console.error),
            )
          }
        }

        await Promise.allSettled(notificationPromises)
      } catch (err: any) {
        console.error('Webhook processing error:', err)
      }
    }

    if (typeof EdgeRuntime !== 'undefined' && typeof EdgeRuntime.waitUntil === 'function') {
      EdgeRuntime.waitUntil(processWebhook(payload))
    } else {
      processWebhook(payload).catch(console.error)
    }

    return new Response(JSON.stringify({ success: true, message: 'Processing asynchronously' }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Support ticket webhook parse error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
