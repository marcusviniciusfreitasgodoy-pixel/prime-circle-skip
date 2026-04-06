import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Eye, Mail, MessageSquare, AlertCircle, RefreshCw, Activity } from 'lucide-react'
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all')

  useEffect(() => {
    if (user) loadLogs()
  }, [user, logType, statusFilter])

  const loadLogs = async () => {
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
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(200)

        if (!isAdmin) {
          query = query.eq('user_id', user!.id)
        }
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter)
        }

        const { data } = await query
        if (data) setLogs(data)
      } else {
        let query = supabase
          .from('user_actions')
          .select('*, profiles(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(200)

        if (!isAdmin) {
          query = query.eq('user_id', user!.id)
        }

        const { data } = await query
        if (data) setLogs(data)
      }
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setIsLoading(false)
    }
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
      await loadLogs()
    } catch (error: any) {
      console.error('Error resending:', error)
      toast({
        title: 'Erro ao reenviar',
        description: error.message || 'Falha no envio',
        variant: 'destructive',
      })
    } finally {
      setIsResending(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Trilha de Auditoria e Logs</h3>
          <p className="text-muted-foreground text-sm">
            Monitore o histórico de disparos (WhatsApp/E-mail) e ações do sistema.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {logType === 'notifications' && (
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[140px] bg-secondary border-border h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falha</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                <TableHead className="text-muted-foreground">Usuário / Destinatário</TableHead>
                <TableHead className="text-muted-foreground">
                  {logType === 'notifications' ? 'Canal' : 'Tipo de Ação'}
                </TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando registros...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado para esta categoria.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-secondary/30">
                    <TableCell className="text-sm text-white whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm text-white font-medium">
                      {logType === 'notifications' ? log.recipient : log.profiles?.email}
                      {log.profiles?.full_name && (
                        <div className="text-xs text-muted-foreground font-normal mt-0.5">
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
                        <span className="text-sm text-muted-foreground">{log.action_type}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {logType === 'notifications' ? (
                        <Badge
                          variant="outline"
                          className={
                            log.status === 'success'
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }
                        >
                          {log.status === 'success' ? 'Enviado' : 'Falha'}
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
                            className={cn('w-3 h-3 mr-1', isResending === log.id && 'animate-spin')}
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              Detalhes do Registro
              {selectedLog?.status && (
                <Badge
                  variant="outline"
                  className={
                    selectedLog?.status === 'success'
                      ? 'text-green-500 border-green-500/20'
                      : 'text-red-500 border-red-500/20'
                  }
                >
                  {selectedLog?.status}
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
              <p className="text-sm text-white whitespace-pre-wrap">
                {logType === 'notifications'
                  ? selectedLog?.message_body
                  : JSON.stringify(selectedLog, null, 2)}
              </p>
            </div>

            {selectedLog?.error_details && (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-500">Erro Reportado</h4>
                  <p className="text-xs text-red-400 mt-1">{selectedLog.error_details}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
