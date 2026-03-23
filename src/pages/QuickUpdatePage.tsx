import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, X, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function QuickUpdatePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<
    'validating' | 'confirm_ready' | 'loading' | 'success' | 'error'
  >('validating')
  const [errorReason, setErrorReason] = useState<string | null>(null)
  const [dados, setDados] = useState<any>(null)
  const [vgv, setVgv] = useState<string>('')
  const [resultado, setResultado] = useState<any>(null)

  const t = searchParams.get('t')
  const s = searchParams.get('s')
  const b = searchParams.get('b')

  useEffect(() => {
    let mounted = true
    const validateToken = async () => {
      if (!t || !s || !b) {
        if (mounted) {
          setStatus('error')
          setErrorReason('Parâmetros incompletos no link.')
        }
        return
      }

      try {
        const { data, error } = await supabase.functions.invoke('process-quick-action', {
          body: { token: t, status_alvo: s, corretor_id: b, apenas_validar: true },
        })

        if (error || !data?.valido) {
          if (mounted) {
            setStatus('error')
            const reason = data?.motivo
            if (reason === 'expirado')
              setErrorReason('Este link expirou. Cada link é válido por 5 dias.')
            else if (reason === 'ja_usado')
              setErrorReason('Esta ação já foi realizada anteriormente.')
            else setErrorReason('Link de ação inválido ou não autorizado.')
          }
        } else {
          if (mounted) {
            setDados(data.dados)
            setStatus('confirm_ready')
          }
        }
      } catch (err) {
        if (mounted) {
          setStatus('error')
          setErrorReason('Ocorreu um erro ao validar o link de ação.')
        }
      }
    }

    validateToken()

    return () => {
      mounted = false
    }
  }, [t, s, b])

  const handleConfirm = async () => {
    if (dados?.status_alvo === 'aguardando_vgv' && dados?.action === 1 && !vgv) {
      alert('Por favor, informe o VGV (Valor Geral de Vendas).')
      return
    }

    setStatus('loading')
    try {
      const vgvNumber = vgv ? parseFloat(vgv.replace(/\D/g, '')) / 100 : undefined

      const { data, error } = await supabase.functions.invoke('process-quick-action', {
        body: { token: t, status_alvo: s, corretor_id: b, apenas_validar: false, vgv: vgvNumber },
      })

      if (error || !data?.sucesso) {
        setStatus('error')
        setErrorReason(data?.error || 'Erro ao executar a ação solicitada.')
      } else {
        setResultado(data)
        setStatus('success')
      }
    } catch (err) {
      setStatus('error')
      setErrorReason('Erro de conexão ao executar a ação. Tente novamente mais tarde.')
    }
  }

  const handleVgvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (!value) {
      setVgv('')
      return
    }
    const numberValue = parseInt(value, 10) / 100
    setVgv(
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue),
    )
  }

  const displayStatusMap: Record<string, string> = {
    match: 'Match',
    contact: 'Contato',
    visit: 'Visita',
    proposal: 'Proposta',
    aguardando_vgv: 'Aguardando VGV',
    closed: 'Fechado',
    cancelled: 'Cancelado',
  }

  const renderActionIcon = () => {
    if (dados?.action === 1) return <ArrowRight className="w-10 h-10 text-primary" />
    if (dados?.action === 2) return <Minus className="w-10 h-10 text-blue-500" />
    if (dados?.action === 3) return <X className="w-10 h-10 text-destructive" />
    return <CheckCircle2 className="w-10 h-10 text-primary" />
  }

  const renderActionMessage = () => {
    if (dados?.action === 1) {
      return (
        <p className="text-muted-foreground text-lg leading-relaxed">
          Você está avançando a negociação do imóvel <strong>{dados.tipo_imovel}</strong> em{' '}
          <strong>{dados.bairro_imovel}</strong> com <strong>{dados.nome_parceiro}</strong> para{' '}
          <strong className="text-white">
            {displayStatusMap[dados.status_alvo] || dados.status_alvo}
          </strong>
          .
        </p>
      )
    }
    if (dados?.action === 2) {
      return (
        <p className="text-muted-foreground text-lg leading-relaxed">
          Você informou que a negociação do imóvel <strong>{dados.tipo_imovel}</strong> com{' '}
          <strong>{dados.nome_parceiro}</strong> ainda está em{' '}
          <strong className="text-white">
            {displayStatusMap[dados.status_atual] || dados.status_atual}
          </strong>
          .
        </p>
      )
    }
    if (dados?.action === 3) {
      return (
        <p className="text-muted-foreground text-lg leading-relaxed">
          Você está encerrando o match do imóvel <strong>{dados.tipo_imovel}</strong> com{' '}
          <strong>{dados.nome_parceiro}</strong>.
        </p>
      )
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card border-border shadow-elevation animate-in fade-in zoom-in duration-500">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          {(status === 'validating' || status === 'loading') && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h2 className="text-2xl font-bold text-white">
                {status === 'validating' ? 'Validando link...' : 'Processando ação...'}
              </h2>
            </>
          )}

          {status === 'confirm_ready' && dados && (
            <>
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-2">
                {renderActionIcon()}
              </div>
              <h2 className="text-2xl font-bold text-white">Confirmar Atualização</h2>
              {renderActionMessage()}

              {dados.action === 1 && dados.status_alvo === 'aguardando_vgv' && (
                <div className="w-full text-left space-y-2 mt-2">
                  <label htmlFor="vgv" className="text-white text-sm font-medium leading-none">
                    Valor Fechado (VGV)
                  </label>
                  <input
                    id="vgv"
                    type="text"
                    value={vgv}
                    onChange={handleVgvChange}
                    placeholder="R$ 0,00"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 w-full mt-4">
                <Button
                  onClick={handleConfirm}
                  className="w-full gold-gradient text-black font-semibold h-12"
                >
                  {dados.action === 1
                    ? 'Confirmar Avanço'
                    : dados.action === 2
                      ? 'Confirmar Status'
                      : 'Confirmar Encerramento'}
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
              <h2 className="text-2xl font-bold text-white">Ação Realizada com Sucesso!</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {resultado?.pontos_ganhos > 0
                  ? `Você ganhou +${resultado.pontos_ganhos} pontos de reputação por avançar seu funil!`
                  : `A parceria foi atualizada e os envolvidos notificados com sucesso.`}
              </p>
              <Button asChild className="w-full mt-4 gold-gradient text-black font-semibold h-12">
                <Link to="/dashboard">Ir para o Painel de Controle</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-white">Não foi possível processar</h2>
              <p className="text-muted-foreground">
                {errorReason || 'Link inválido ou ocorreu um erro interno.'}
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
