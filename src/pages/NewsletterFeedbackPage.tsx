import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function NewsletterFeedbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const submitFeedback = async () => {
      const nl_id = searchParams.get('nl_id')
      const u = searchParams.get('u')
      const v = searchParams.get('v')

      if (!nl_id || !u || !v) {
        setStatus('error')
        return
      }

      try {
        const { error } = await supabase.functions.invoke('register-newsletter-feedback', {
          body: { nl_id, u, v },
        })

        if (error) throw error
        setStatus('success')
      } catch (err) {
        console.error('Error submitting feedback', err)
        setStatus('error')
      }
    }

    submitFeedback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-primary/20 shadow-elevation relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl text-white">Feedback Recebido</CardTitle>
          <CardDescription>
            Sua opinião ajuda a melhorar nossa curadoria de mercado.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center p-6 pb-8 space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center text-muted-foreground gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p>Registrando seu voto...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center text-center gap-4 animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-white font-medium text-lg">Obrigado pelo seu feedback!</p>
              <p className="text-sm text-muted-foreground">
                Seu voto foi contabilizado com sucesso. Continuaremos trabalhando para trazer os
                melhores conteúdos para a rede Prime Circle.
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="mt-4 gold-gradient text-black font-bold"
              >
                <Home className="w-4 h-4 mr-2" /> Voltar ao Painel
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center text-center gap-4">
              <p className="text-red-400 font-medium">Não foi possível registrar seu feedback.</p>
              <p className="text-sm text-muted-foreground">
                O link pode estar quebrado ou já expirou.
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="mt-4 border-border text-white"
              >
                <Home className="w-4 h-4 mr-2" /> Voltar ao Painel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
