import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase/client'
import {
  Loader2,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  XSquare,
  Send,
  PieChart,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function WhatsAppCollectionTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: res, error } = await supabase.rpc('get_whatsapp_collection_metrics')
      if (res && !error && !res.error) {
        setData(res)
      }
    } catch (err) {
      console.error('Failed to fetch whatsapp collection data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleReenviar = async (p: any) => {
    try {
      setProcessingId(p.id)
      await supabase.functions.invoke('send-status-check', { body: { partnerships: [p] } })
      await supabase.from('partnerships').update({ status_check_failed: false }).eq('id', p.id)
      toast.success('Link reenviado com sucesso.')
      fetchData()
    } catch (e) {
      toast.error('Erro ao reenviar link.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleEncerrar = async () => {
    if (!confirmId) return
    try {
      setProcessingId(confirmId)
      await supabase
        .from('partnerships')
        .update({
          status: 'cancelado',
          updated_at: new Date().toISOString(),
          admin_flagged: false,
          status_check_failed: false,
        })
        .eq('id', confirmId)
      toast.success('Match encerrado com sucesso.')
      fetchData()
    } catch (e) {
      toast.error('Erro ao encerrar match.')
    } finally {
      setProcessingId(null)
      setConfirmId(null)
    }
  }

  const handleLimparFlag = async (id: string) => {
    try {
      setProcessingId(id)
      await supabase
        .from('partnerships')
        .update({ admin_flagged: false, status_check_failed: false })
        .eq('id', id)
      toast.success('Atenção removida.')
      fetchData()
    } catch (e) {
      toast.error('Erro ao limpar flag.')
    } finally {
      setProcessingId(null)
    }
  }

  const getDiasParado = (dateStr: string) => {
    if (!dateStr) return '-'
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 86400000)
    return `${diff} dia${diff !== 1 ? 's' : ''}`
  }

  if (loading && !data) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const { metrics, fila = [], historico = [] } = data || {}
  const actionDist = metrics?.action_dist || { action_1: 0, action_2: 0, action_3: 0, total: 1 }
  const totalActions = Math.max(actionDist.total, 1)

  return (
    <div className="space-y-8 pb-8">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checks Enviados
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics?.checks_enviados || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Resposta
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics?.taxa_resposta || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tokens clicados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distribuição
            </CardTitle>
            <PieChart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex h-2 w-full rounded-full overflow-hidden mt-2 mb-2 bg-secondary">
              <div
                style={{ width: `${(actionDist.action_1 / totalActions) * 100}%` }}
                className="bg-green-500"
              />
              <div
                style={{ width: `${(actionDist.action_2 / totalActions) * 100}%` }}
                className="bg-yellow-500"
              />
              <div
                style={{ width: `${(actionDist.action_3 / totalActions) * 100}%` }}
                className="bg-red-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="text-green-500">{actionDist.action_1} Av</span>
              <span className="text-yellow-500">{actionDist.action_2} Ma</span>
              <span className="text-red-500">{actionDist.action_3} En</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn('bg-card border-border', metrics?.fila_count > 0 && 'border-red-500/50')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fila de Atenção
            </CardTitle>
            <AlertTriangle
              className={cn(
                'w-4 h-4',
                metrics?.fila_count > 0 ? 'text-red-500' : 'text-muted-foreground',
              )}
            />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{metrics?.fila_count || 0}</span>
              {metrics?.fila_count > 0 && (
                <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
                  Ação Necessária
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Parcerias travadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Fila de Atenção (Tabela) */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Fila de Atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Corretores (Dem. / Imóvel)</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Dias Parado</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fila.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma parceria travada no momento. Tudo fluindo!
                  </TableCell>
                </TableRow>
              ) : (
                fila.map((p: any) => (
                  <TableRow key={p.id} className="border-border group">
                    <TableCell className="font-medium text-white max-w-[200px] truncate">
                      <div className="text-sm">{p.broker_demand_name || 'Desconhecido'}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.broker_property_name || 'Desconhecido'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize text-xs border-primary/20 text-primary"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getDiasParado(p.last_status_check_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] whitespace-nowrap',
                          p.status_check_failed
                            ? 'text-orange-400 border-orange-400/20 bg-orange-400/10'
                            : '',
                          p.admin_flagged && !p.status_check_failed
                            ? 'text-red-400 border-red-400/20 bg-red-400/10'
                            : '',
                        )}
                      >
                        {p.status_check_failed ? 'Link expirou sem uso' : '72h sem resposta'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={processingId === p.id}
                        onClick={() => handleReenviar(p)}
                        className="h-8 text-xs bg-transparent border-border hover:text-white"
                      >
                        {processingId === p.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3 mr-1" />
                        )}
                        Reenviar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={processingId === p.id}
                        onClick={() => setConfirmId(p.id)}
                        className="h-8 text-xs border-red-500/20 text-red-500 hover:bg-red-500/10"
                      >
                        <XSquare className="w-3 h-3 mr-1" /> Encerrar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processingId === p.id}
                        onClick={() => handleLimparFlag(p.id)}
                        className="h-8 text-xs text-muted-foreground hover:text-white"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Limpar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Histórico Recente (Tabela) */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">Histórico de Interações (Últimas 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[160px]">Data/Hora</TableHead>
                <TableHead>Corretor</TableHead>
                <TableHead>Ação Executada</TableHead>
                <TableHead>Etapa Resultante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhuma interação recente registrada.
                  </TableCell>
                </TableRow>
              ) : (
                historico.map((h: any) => (
                  <TableRow key={h.id} className="border-border">
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(h.updated_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium text-white">{h.corretor_nome}</TableCell>
                    <TableCell>
                      {h.action === 1 && <span className="text-green-500 text-sm">Avançou</span>}
                      {h.action === 2 && <span className="text-yellow-500 text-sm">Manteve</span>}
                      {h.action === 3 && <span className="text-red-500 text-sm">Encerrou</span>}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize text-[10px] text-muted-foreground border-border"
                      >
                        {h.action === 1 ? h.status_alvo : h.partnership_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Confirmação para Encerrar */}
      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Encerrar Parceria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação marcará a negociação como <strong>Cancelada</strong> e removerá a mesma da
              fila de atenção. Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-white hover:bg-secondary">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEncerrar}
              disabled={!!processingId}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {processingId === confirmId ? 'Processando...' : 'Confirmar Encerramento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
