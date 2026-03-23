import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
  MapPin,
  User2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const STATUS_MAP: Record<string, string> = {
  novo: 'Novo',
  match: 'Match',
  contact: 'Contato',
  contato: 'Contato',
  visit: 'Visita',
  visita: 'Visita',
  proposal: 'Proposta',
  proposta: 'Proposta',
  aguardando_vgv: 'Aguardando VGV',
  closed: 'Fechado',
  fechado: 'Fechado',
  cancelled: 'Cancelado',
  cancelado: 'Cancelado',
}

type PageStatus = 'validating' | 'invalid' | 'ready' | 'processing' | 'success' | 'process_error'

export default function QuickUpdatePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<PageStatus>('validating')
  const [dados, setDados] = useState<any>(null)
  const [vgv, setVgv] = useState('')

  const t = searchParams.get('t')
  const s = searchParams.get('s')
  const b = searchParams.get('b')

  useEffect(() => {
    let mounted = true
    const validate = async () => {
      if (!t || !s || !b) return mounted && setStatus('invalid')

      try {
        const { data, error } = await supabase.functions.invoke('process-quick-action', {
          body: { token: t, status_alvo: s, corretor_id: b, apenas_validar: true },
        })
        if (error || !data?.valido) {
          if (mounted) setStatus('invalid')
        } else if (mounted) {
          setDados(data.dados)
          setStatus('ready')
        }
      } catch {
        if (mounted) setStatus('invalid')
      }
    }
    validate()
    return () => {
      mounted = false
    }
  }, [t, s, b])

  const handleVgvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (!value) return setVgv('')
    const num = parseInt(value, 10) / 100
    setVgv(
      new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        num,
      ),
    )
  }

  const handleConfirm = async () => {
    if (dados?.status_alvo === 'aguardando_vgv' && dados?.action === 1 && !vgv) return
    setStatus('processing')
    try {
      // Convert BRL format "3.500.000,00" to float 3500000.00
      const vgvNum = vgv ? parseFloat(vgv.replace(/\./g, '').replace(',', '.')) : undefined
      const { data, error } = await supabase.functions.invoke('process-quick-action', {
        body: { token: t, status_alvo: s, corretor_id: b, apenas_validar: false, vgv: vgvNum },
      })
      if (error || !data?.sucesso) setStatus('process_error')
      else setStatus('success')
    } catch {
      setStatus('process_error')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-elevation animate-in fade-in zoom-in duration-300">
        <CardContent className="p-6 md:p-8 flex flex-col items-center">
          {status === 'validating' && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          )}

          {status === 'invalid' && (
            <div className="flex flex-col items-center w-full">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 text-center">
                Link expirado ou já utilizado
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Este link de atualização foi usado ou expirou. Acesse o painel para atualizar o
                status manualmente.
              </p>
              <Button
                asChild
                className="w-full h-12 text-base font-semibold gold-gradient text-black"
              >
                <Link to="/matches">Ir para o painel</Link>
              </Button>
            </div>
          )}

          {(status === 'ready' || status === 'processing') && dados && (
            <div className="flex flex-col items-center w-full">
              <div className="flex flex-col items-center mb-6 text-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent gold-gradient">
                  Prime Circle
                </h1>
                <h2 className="text-lg font-medium text-white mt-1">Atualização de match</h2>
              </div>

              <div className="bg-muted/30 border border-border p-4 rounded-lg w-full mb-6 text-left space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <User2 className="w-4 h-4 text-primary" />
                  <span className="font-medium">{dados.nome_parceiro}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>{dados.tipo_imovel}</span>
                </div>
                {dados.bairro_imovel && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{dados.bairro_imovel}</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border/50">
                  <div className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">
                    {STATUS_MAP[dados.status_atual] || dados.status_atual}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium uppercase tracking-wider">
                    {STATUS_MAP[dados.status_alvo] || dados.status_alvo}
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-center mb-6 text-sm">
                {dados.action === 1 && 'Você está confirmando o avanço desta parceria.'}
                {dados.action === 2 && 'Você está mantendo o status atual desta parceria.'}
                {dados.action === 3 && 'Você está encerrando esta parceria.'}
              </p>

              {dados.status_alvo === 'aguardando_vgv' && dados.action === 1 && (
                <div className="w-full space-y-2 mb-6 text-left">
                  <Label htmlFor="vgv" className="text-white">
                    Qual foi o valor do negócio? (R$)
                  </Label>
                  <Input
                    id="vgv"
                    type="text"
                    placeholder="Ex: 3.500.000,00"
                    value={vgv}
                    onChange={handleVgvChange}
                    className="h-12 text-lg text-white"
                  />
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={
                  status === 'processing' ||
                  (dados.status_alvo === 'aguardando_vgv' && dados.action === 1 && !vgv)
                }
                className="w-full h-12 text-base font-semibold gold-gradient text-black"
              >
                {status === 'processing' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {dados.action === 1 && 'Confirmar avanço'}
                    {dados.action === 2 && 'Confirmar — manter status'}
                    {dados.action === 3 && 'Confirmar encerramento'}
                  </>
                )}
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center w-full">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 text-center">
                {dados?.action === 1 && 'Match avançado! +2 pontos de reputação'}
                {dados?.action === 2 && 'Status mantido. Obrigado pelo retorno!'}
                {dados?.action === 3 && 'Parceria encerrada. Obrigado pelo retorno.'}
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                {dados?.action === 1
                  ? 'Sua reputação subiu! Continue avançando parcerias para se destacar na rede.'
                  : 'A atualização foi registrada com sucesso em seu painel.'}
              </p>
              <Button
                asChild
                className="w-full h-12 text-base font-semibold gold-gradient text-black"
              >
                <Link to="/matches">Ver no painel</Link>
              </Button>
            </div>
          )}

          {status === 'process_error' && (
            <div className="flex flex-col items-center w-full">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 text-center">
                Esta ação já foi processada.
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Não foi possível concluir a operação ou o link já foi invalidado por outra aba.
              </p>
              <Button
                asChild
                className="w-full h-12 text-base font-semibold gold-gradient text-black"
              >
                <Link to="/matches">Ir para o painel</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
