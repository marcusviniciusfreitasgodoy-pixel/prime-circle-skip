import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function QuickUpdatePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<
    'loading' | 'validating' | 'confirm_ready' | 'success' | 'error'
  >('validating')
  const [partnershipDetails, setPartnershipDetails] = useState<any>(null)

  const t = searchParams.get('t')
  const s = searchParams.get('s')
  const b = searchParams.get('b')

  useEffect(() => {
    let mounted = true
    const validateToken = async () => {
      if (!t || !s || !b) {
        if (mounted) setStatus('error')
        return
      }

      try {
        const { data, error } = await supabase.functions.invoke('process-quick-action', {
          body: { token: t, status_alvo: s, corretor_id: b, apenas_validar: true },
        })

        if (error || !data?.valido) {
          if (mounted) setStatus('error')
        } else {
          if (mounted) {
            setPartnershipDetails(data.partnership)
            setStatus('confirm_ready')
          }
        }
      } catch (err) {
        if (mounted) setStatus('error')
      }
    }

    validateToken()

    return () => {
      mounted = false
    }
  }, [t, s, b])

  const handleConfirm = async () => {
    setStatus('loading')
    try {
      const { data, error } = await supabase.functions.invoke('process-quick-action', {
        body: { token: t, status_alvo: s, corretor_id: b, apenas_validar: false },
      })

      if (error || !data?.success) {
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  const displayStatusMap: Record<string, string> = {
    match: 'MATCH',
    contact: 'CONTATO',
    visit: 'VISITA',
    proposal: 'PROPOSTA',
    closed: 'FECHAMENTO',
    cancelled: 'CANCELADO',
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card border-border shadow-elevation animate-in fade-in zoom-in duration-500">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          {(status === 'validating' || status === 'loading') && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h2 className="text-2xl font-bold text-white">
                {status === 'validating' ? 'Validando link...' : 'Atualizando Status...'}
              </h2>
            </>
          )}

          {status === 'confirm_ready' && (
            <>
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white">Confirmar Atualização</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Você está prestes a atualizar o status desta parceria para{' '}
                <strong className="text-white uppercase">
                  {s ? displayStatusMap[s] || s : ''}
                </strong>
                .
              </p>
              <div className="flex flex-col gap-3 w-full mt-4">
                <Button
                  onClick={handleConfirm}
                  className="w-full gold-gradient text-black font-semibold h-12"
                >
                  Confirmar Atualização
                </Button>
                <Button asChild variant="outline" className="w-full h-12">
                  <Link to="/dashboard">Cancelar e ir para o Painel</Link>
                </Button>
              </div>
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
              <Button asChild className="w-full mt-4 gold-gradient text-black font-semibold h-12">
                <Link to="/dashboard">Ir para o Painel de Controle</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-white">Link expirado ou já utilizado</h2>
              <p className="text-muted-foreground">
                Este link de atualização foi usado ou expirou. Acesse o painel para atualizar o
                status manualmente.
              </p>
              <Button asChild variant="outline" className="w-full mt-4 h-12">
                <Link to="/dashboard">Acessar Painel</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
