import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Eye, Mail, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchLogs, NotificationLog } from '@/services/notifications'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function LogsTab() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null)
  const [isResending, setIsResending] = useState<string | null>(null)

  useEffect(() => {
    if (user) loadLogs()
  }, [user])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

      const isAdmin = profile?.role === 'admin'

      let query = supabase
        .from('notification_logs')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!isAdmin) {
        query = query.eq('user_id', user!.id)
      }

      const { data } = await query
      if (data) setLogs(data as any[])
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async (log: NotificationLog) => {
    setIsResending(log.id)
    try {
      let res

      if (log.channel === 'whatsapp') {
        res = await supabase.functions.invoke('send-whatsapp', {
          body: { number: log.recipient, text: log.message_body, user_id: log.user_id },
        })
      } else if (log.channel === 'email') {
        let subject = 'Notificação Prime Circle'
        let bodyText = log.message_body

        const match = bodyText.match(/^Assunto:\s*(.+)\n+([\s\S]*)$/i)
        if (match) {
          subject = match[1].trim()
          bodyText = match[2].trim()
        }

        res = await supabase.functions.invoke('send-email', {
          body: { to: log.recipient, subject, text: bodyText, user_id: log.user_id },
        })
      }

      if (res?.error) throw res.error
      if (res?.data?.error) {
        const errMsg =
          typeof res.data.error === 'string' ? res.data.error : JSON.stringify(res.data.error)
        throw new Error(errMsg)
      }
      if (res?.data?.success === false) {
        throw new Error('Falha no envio da notificação')
      }

      // Atualiza o log atual para sucesso para remover o status de falha visual
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

  if (isLoading)
    return <div className="text-muted-foreground py-8 text-center">Carregando histórico...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Histórico de Envios</h3>
          <p className="text-muted-foreground text-sm">
            Monitore os status de entrega das suas notificações e fallbacks.
          </p>
        </div>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                <TableHead className="text-muted-foreground">Destinatário / Usuário</TableHead>
                <TableHead className="text-muted-foreground">Canal</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="text-sm text-white">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-sm text-white font-medium">
                    {log.recipient}
                    {(log as any).profiles?.full_name && (
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        {(log as any).profiles.full_name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {log.channel === 'whatsapp' ? (
                        <MessageSquare className="w-4 h-4 text-green-500" />
                      ) : (
                        <Mail className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="capitalize">{log.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {log.status === 'failed' && (
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
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro de notificação encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              Detalhes da Notificação
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
            </DialogTitle>
            <DialogDescription>
              Enviado via {selectedLog?.channel} para {selectedLog?.recipient}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm text-white whitespace-pre-wrap">{selectedLog?.message_body}</p>
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
