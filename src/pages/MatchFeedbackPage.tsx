import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function MatchFeedbackPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const documentId = searchParams.get('id')
  const type = searchParams.get('type')

  useEffect(() => {
    let mounted = true

    const submitFeedback = async () => {
      if (!user || !documentId || !type) {
        if (mounted) setStatus('error')
        return
      }

      if (type !== 'perfect' && type !== 'not_suitable') {
        if (mounted) setStatus('error')
        return
      }

      const { error } = await supabase.from('match_feedback').insert({
        user_id: user.id,
        document_id: parseInt(documentId, 10),
        feedback_type: type,
      })

      if (!mounted) return

      if (error) {
        console.error('Failed to submit feedback:', error)
        setStatus('error')
      } else {
        setStatus('success')
        setTimeout(() => {
          if (mounted) navigate('/dashboard')
        }, 3500)
      }
    }

    submitFeedback()

    return () => {
      mounted = false
    }
  }, [user, documentId, type, navigate])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card border-border shadow-elevation animate-in fade-in zoom-in duration-500">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h2 className="text-2xl font-bold text-white">Registrando Feedback...</h2>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Feedback Registrado!</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Obrigado pelo seu feedback! Isso ajuda a Sofia (nossa IA) a encontrar oportunidades
                melhores para você.
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/dashboard">Ir para o Dashboard</Link>
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-white">Erro ao registrar</h2>
              <p className="text-muted-foreground">
                Não foi possível processar seu feedback ou o link é inválido. Tente novamente mais
                tarde.
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/dashboard">Ir para o Dashboard</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
