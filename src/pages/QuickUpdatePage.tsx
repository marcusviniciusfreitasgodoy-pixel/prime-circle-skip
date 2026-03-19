import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function QuickUpdatePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const t = searchParams.get('t')
  const s = searchParams.get('s')
  const b = searchParams.get('b')

  useEffect(() => {
    let mounted = true
    const updateStatus = async () => {
      if (!t || !s || !b) {
        if (mounted) setStatus('error')
        return
      }

      try {
        const { data, error } = await supabase.rpc('quick_update_partnership', {
          p_token: t,
          p_status: s,
          p_broker_id: b,
        })

        if (error || !data) {
          console.error(error)
          if (mounted) setStatus('error')
        } else {
          if (mounted) setStatus('success')
        }
      } catch (err) {
        if (mounted) setStatus('error')
      }
    }

    updateStatus()

    return () => {
      mounted = false
    }
  }, [t, s, b])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card border-border shadow-elevation animate-in fade-in zoom-in duration-500">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h2 className="text-2xl font-bold text-white">Atualizando Status...</h2>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Status Atualizado com Sucesso!</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Você ganhou +5 pontos de reputação por manter seu funil ativo e seus parceiros foram
                notificados.
              </p>
              <Button asChild className="w-full mt-4 gold-gradient text-black font-semibold">
                <Link to="/dashboard">Ir para o Painel de Controle</Link>
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-white">Erro na Atualização</h2>
              <p className="text-muted-foreground">
                Link inválido ou expirado. Acesse a plataforma para atualizar manualmente.
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/dashboard">Acessar Painel</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
