import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { sendWhatsappMessage } from '@/services/whatsapp'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Eye,
  Mail,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  Trash,
  Trash2,
} from 'lucide-react'
import { NotificationLog } from '@/services/notifications'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type LogType = 'notifications' | 'actions'

export function LogsTab() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [logs, setLogs] = useState<any[]>([])
  const [logType, setLogType] = useState<LogType>('notifications')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const [isResending, setIsResending] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'test_sent'>(
    'all',
  )
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'email' | 'push'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 50

  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, successRate: 0 })
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isClearingAll, setIsClearingAll] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setIsAdmin(data?.role === 'admin')
        })
    }
  }, [user])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadStats = useCallback(async () => {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      let query = supabase.from('notification_logs').select('status').gte('created_at', yesterday)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()
      if (profile?.role !== 'admin') {
        query = query.eq('user_id', user!.id)
      }

      const { data, error } = await query
      if (error) throw error

      if (data) {
        const total = data.length
        const success = data.filter((d) => d.status === 'success').length
        const failed = data.filter((d) => d.status === 'failed').length
        const successRate = total > 0 ? Math.round((success / total) * 100) : 0
        setStats({ total, success, failed, successRate })
      }
    } catch (err) {
      console.error('Error loading stats', err)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      setPage(0)
      loadLogs(0, true)
      if (logType === 'notifications') {
        loadStats()
      }
    }
  }, [user, logType, statusFilter, channelFilter, debouncedSearch, loadStats])

  const loadLogs = async (pageNum: number, reset: boolean = false) => {
    setIsLoading(true)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

      const isAdmin = profile?.role === 'admin'

      if (logType === 'notifications') {
        let query = supabase
          .from('notification_logs')
          .select('*, profiles(full_name)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1)

        if (!isAdmin) {
          query = query.eq('user_id', user!.id)
        }
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter)
        }
        if (channelFilter !== 'all') {
          query = query.eq('channel', channelFilter)
        }
        if (debouncedSearch) {
          query = query.or(
            `recipient.ilike.%${debouncedSearch}%,message_body.ilike.%${debouncedSearch}%`,
          )
        }

        const { data, count } = await query
        if (data) {
          setLogs((prev) => (reset ? data : [...prev, ...data]))
          setHasMore(count ? (pageNum + 1) * ITEMS_PER_PAGE < count : false)
        }
      } else {
        let query = supabase
          .from('user_actions')
          .select('*, profiles(full_name, email)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1)

        if (!isAdmin) {
          query = query.eq('user_id', user!.id)
        }
        if (debouncedSearch) {
          query = query.ilike('action_type', `%${debouncedSearch}%`)
        }

        const { data, count } = await query
        if (data) {
          setLogs((prev) => (reset ? data : [...prev, ...data]))
          setHasMore(count ? (pageNum + 1) * ITEMS_PER_PAGE < count : false)
        }
      }
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadLogs(nextPage)
  }

  const handleResend = async (log: NotificationLog) => {
    setIsResending(log.id)
    try {
      if (log.channel === 'whatsapp') {
        await sendWhatsappMessage(log.recipient, log.message_body, log.user_id)
      } else if (log.channel === 'email') {
        let subject = 'Notificação Prime Circle'
        let bodyText = log.message_body

        const match = bodyText.match(/^Assunto:\s*(.+)\n+([\s\S]*)$/i)
        if (match) {
          subject = match[1].trim()
          bodyText = match[2].trim()
        }

        const res = await supabase.functions.invoke('send-email', {
          body: { to: log.recipient, subject, text: bodyText, user_id: log.user_id },
        })

        if (res?.error) throw res.error
        if (res?.data?.error) {
          const errMsg =
            typeof res.data.error === 'string' ? res.data.error : JSON.stringify(res.data.error)
          throw new Error(errMsg)
        }
        if (res?.data?.success === false) {
          throw new Error('Falha no envio do e-mail')
        }
      }

      await supabase
        .from('notification_logs')
        .update({ status: 'success', error_details: null })
        .eq('id', log.id)

      setLogs((currentLogs) =>
        currentLogs.map((l) =>
          l.id === log.id ? { ...l, status: 'success', error_details: null } : l,
        ),
      )

      toast({ title: 'Notificação reenviada com sucesso' })
      loadStats()
    } catch (error: any) {
      console.error('Error resending:', error)
      toast({
        title: 'Erro ao reenviar',
        description: error.message || 'Falha no envio, tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsResending(null)
    }
  }

  const handleDeleteLog = async (logId: string) => {
    setIsDeleting(logId)
    try {
      const table = logType === 'notifications' ? 'notification_logs' : 'user_actions'
      const { error } = await supabase.from(table).delete().eq('id', logId)
      if (error) throw error

      setLogs((prev) => prev.filter((l) => l.id !== logId))
      toast({ title: 'Registro excluído com sucesso' })
      if (logType === 'notifications') loadStats()
    } catch (error: any) {
      console.error('Error deleting log:', error)
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Ocorreu um erro ao excluir o registro.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleClearAll = async () => {
    setIsClearingAll(true)
    try {
      const table = logType === 'notifications' ? 'notification_logs' : 'user_actions'
      let query = supabase.from(table).delete()

      if (!isAdmin) {
        query = query.eq('user_id', user!.id)
      } else {
        query = query.not('id', 'is', null)
      }

      const { error } = await query
      if (error) throw error

      setLogs([])
      toast({ title: 'Todos os registros foram excluídos' })
      if (logType === 'notifications') loadStats()
    } catch (error: any) {
      console.error('Error clearing logs:', error)
      toast({
        title: 'Erro ao limpar registros',
        description: error.message || 'Ocorreu um erro ao limpar os registros.',
        variant: 'destructive',
      })
    } finally {
      setIsClearingAll(false)
    }
  }

  const parseErrorDetails = (details: string | null) => {
    if (!details) return ''
    try {
      const parsed = JSON.parse(details)
      if (parsed.apiResponse) {
        const apiError =
          parsed.apiResponse.error ||
          parsed.apiResponse.message ||
          parsed.apiResponse.error_description
        let result = apiError || details
        if (parsed.status) {
          result = `Status HTTP ${parsed.status}: ${result}`
        }
        if (parsed.attempts > 1) {
          result += ` (Falhou após ${parsed.attempts} tentativas de reenvio automático)`
        }

        if (
          result.toLowerCase().includes('disconnected') ||
          result.toLowerCase().includes('not connected') ||
          result.toLowerCase().includes('sem sessão')
        ) {
          result =
            '⚠️ WhatsApp desconectado. Verifique a conexão do seu aparelho no painel da Z-api.\n\nDetalhes técnicos: ' +
            result
        } else if (
          result.toLowerCase().includes('invalid format') ||
          result.toLowerCase().includes('invalid phone') ||
          result.toLowerCase().includes('not valid')
        ) {
          result =
            '❌ Número inválido. Verifique o formato do telefone do destinatário (ex: 5511999999999).\n\nDetalhes técnicos: ' +
            result
        }
        return result
      }
      if (parsed.message) return parsed.message
      return details
    } catch {
      if (
        details.toLowerCase().includes('disconnected') ||
        details.toLowerCase().includes('not connected')
      ) {
        return '⚠️ WhatsApp desconectado.\n\nDetalhes: ' + details
      }
      return details
    }
  }

  return (
    <div className="space-y-6">
      {logType === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disparos (24h)</p>
                <h4 className="text-2xl font-bold text-white">{stats.total}</h4>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full text-green-500 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso (24h)</p>
                <h4 className="text-2xl font-bold text-white">{stats.successRate}%</h4>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full text-red-500 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falhas (24h)</p>
                <h4 className="text-2xl font-bold text-white">{stats.failed}</h4>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar destinatário ou mensagem..."
              className="pl-9 bg-secondary/50 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {logType === 'notifications' && (
            <>
              <Select value={channelFilter} onValueChange={(v: any) => setChannelFilter(v)}>
                <SelectTrigger className="w-[140px] bg-secondary border-border h-9">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Canais</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-[140px] bg-secondary border-border h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failed">Falha</SelectItem>
                  <SelectItem value="test_sent">Teste Enviado</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          <div className="flex bg-secondary/50 p-1 rounded-lg border border-border shrink-0">
            <Button
              variant={logType === 'notifications' ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'text-sm px-3',
                logType === 'notifications' && 'bg-background shadow-sm text-primary',
              )}
              onClick={() => setLogType('notifications')}
            >
              <Mail className="w-4 h-4 mr-2" /> Comunicações
            </Button>
            <Button
              variant={logType === 'actions' ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'text-sm px-3',
                logType === 'actions' && 'bg-background shadow-sm text-primary',
              )}
              onClick={() => setLogType('actions')}
            >
              <Activity className="w-4 h-4 mr-2" /> Ações do Sistema
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-9 shrink-0">
                <Trash className="w-4 h-4 mr-2" />
                Limpar Tudo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Limpar todos os registros?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir todos os registros de{' '}
                  {logType === 'notifications' ? 'comunicações' : 'ações do sistema'}? Esta ação não
                  pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-white border-border hover:bg-secondary/80">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isClearingAll ? 'Limpando...' : 'Sim, excluir tudo'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground whitespace-nowrap">
                    Data/Hora
                  </TableHead>
                  <TableHead className="text-muted-foreground whitespace-nowrap">
                    Usuário / Destinatário
                  </TableHead>
                  <TableHead className="text-muted-foreground whitespace-nowrap">
                    {logType === 'notifications' ? 'Canal' : 'Tipo de Ação'}
                  </TableHead>
                  <TableHead className="text-muted-foreground whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground whitespace-nowrap">
                    Detalhes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && page === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Carregando registros...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-secondary/30">
                      <TableCell className="text-sm text-white whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-sm text-white font-medium max-w-[200px] truncate">
                        {logType === 'notifications' ? log.recipient : log.profiles?.email}
                        {log.profiles?.full_name && (
                          <div className="text-xs text-muted-foreground font-normal mt-0.5 truncate">
                            {log.profiles.full_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {logType === 'notifications' ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {log.channel === 'whatsapp' ? (
                              <MessageSquare className="w-4 h-4 text-green-500" />
                            ) : log.channel === 'push' ? (
                              <Activity className="w-4 h-4 text-purple-500" />
                            ) : (
                              <Mail className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="capitalize">{log.channel}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground truncate block max-w-[200px]">
                            {log.action_type}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {logType === 'notifications' ? (
                          <Badge
                            variant="outline"
                            className={
                              log.status === 'success'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : log.status === 'test_sent'
                                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                  : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }
                          >
                            {log.status === 'success'
                              ? 'Enviado'
                              : log.status === 'test_sent'
                                ? 'Teste Enviado'
                                : 'Falha'}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            Registrado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {logType === 'notifications' && log.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2 border-primary/50 text-primary hover:bg-primary/10 h-8"
                            onClick={() => handleResend(log)}
                            disabled={isResending === log.id}
                          >
                            <RefreshCw
                              className={cn(
                                'w-3 h-3 mr-1',
                                isResending === log.id && 'animate-spin',
                              )}
                            />
                            Reenviar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-white h-8"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 ml-1 px-2"
                          onClick={() => handleDeleteLog(log.id)}
                          disabled={isDeleting === log.id}
                          title="Excluir registro"
                        >
                          {isDeleting === log.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {hasMore && !isLoading && logs.length > 0 && (
            <div className="flex justify-center p-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="bg-secondary/50 border-border hover:bg-secondary"
              >
                Carregar Mais Registros
              </Button>
            </div>
          )}
          {isLoading && page > 0 && (
            <div className="flex justify-center p-4 border-t border-border text-muted-foreground text-sm">
              Carregando mais registros...
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              Detalhes do Registro
              {selectedLog?.status && (
                <Badge
                  variant="outline"
                  className={
                    selectedLog?.status === 'success'
                      ? 'text-green-500 border-green-500/20'
                      : selectedLog?.status === 'test_sent'
                        ? 'text-blue-500 border-blue-500/20'
                        : 'text-red-500 border-red-500/20'
                  }
                >
                  {selectedLog?.status === 'test_sent' ? 'Teste Enviado' : selectedLog?.status}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {logType === 'notifications'
                ? `Enviado via ${selectedLog?.channel} para ${selectedLog?.recipient}`
                : `Ação do sistema: ${selectedLog?.action_type}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm text-white whitespace-pre-wrap font-mono text-xs">
                {logType === 'notifications'
                  ? selectedLog?.message_body
                  : JSON.stringify(selectedLog, null, 2)}
              </p>
            </div>

            {selectedLog?.error_details && (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-semibold text-red-500 mb-1">Motivo da Falha</h4>
                  <div className="text-sm text-red-400 whitespace-pre-wrap break-words">
                    {parseErrorDetails(selectedLog.error_details)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
