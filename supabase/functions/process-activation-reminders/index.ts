import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: users, error } = await supabase.rpc('get_inactive_profiles_for_activation')
    if (error) throw error

    let processed = 0
    for (const user of users || []) {
      const firstName = user.full_name ? user.full_name.split(' ')[0] : 'Parceiro'

      const waMsg = `Olá, *${firstName}*! 🚀 Notamos que você ainda não ativou sua conta na Prime Circle. Nossa rede é movida pela colaboração e os matches só acontecem quando você participa!\n\nO cadastro de um imóvel ou de uma demanda é *extremamente simples e leva menos de 2 minutos*. Que tal começar agora e abrir novas portas para seus negócios?\n\n🌟 *Dica:* Convide seus colegas de confiança! Quanto maior a rede, mais matches você recebe.\nSeu link: https://www.primecircle.app.br/?ref=${user.id}\n\nAcesse aqui: https://www.primecircle.app.br/dashboard`

      const emailSubject = `Sente falta de novos negócios? Ative sua conta na Prime Circle! 🏠`
      const emailBody = `Olá, <strong>${firstName}</strong>,<br/><br/>Percebemos que você se cadastrou na Prime Circle, mas ainda não inseriu seus imóveis ou demandas.<br/><br/>Nossa ferramenta foi feita para gerar liquidez e parcerias de alto padrão, mas ela só funciona plenamente com a sua participação.<br/><br/>O processo de cadastro é <strong>muito rápido (menos de 2 minutos!)</strong>. Ao inserir pelo menos uma opção ou demanda, nosso sistema já começa a buscar matches para você automaticamente.<br/><br/>Além disso, quanto maior a rede, mais e melhores serão os seus matches. Convide seus colegas corretores de confiança usando o seu link de indicação e ganhe benefícios exclusivos!<br/>Seu link de indicação: <a href="https://www.primecircle.app.br/?ref=${user.id}">https://www.primecircle.app.br/?ref=${user.id}</a><br/><br/><a href="https://www.primecircle.app.br/dashboard" style="display:inline-block;padding:12px 24px;background:#C9A84C;color:#000;text-decoration:none;border-radius:4px;font-weight:bold;">Acessar meu Dashboard</a><br/><br/>Boas vendas,<br/><strong>Equipe Prime Circle</strong>`

      if (user.whatsapp_number) {
        await supabase.functions
          .invoke('send-whatsapp', {
            body: { number: user.whatsapp_number, text: waMsg, user_id: user.id },
          })
          .catch(console.error)
      }

      if (user.email) {
        await supabase.functions
          .invoke('send-email', {
            body: { to: user.email, subject: emailSubject, text: emailBody, user_id: user.id },
          })
          .catch(console.error)
      }

      await supabase
        .from('profiles')
        .update({ last_activation_reminder_at: new Date().toISOString() })
        .eq('id', user.id)

      processed++
    }

    return new Response(JSON.stringify({ success: true, processed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
