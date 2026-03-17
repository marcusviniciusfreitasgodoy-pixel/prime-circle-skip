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
import { Eye, Mail, MessageSquare, AlertCircle } from 'lucide-react'
import { fetchLogs, NotificationLog } from '@/services/notifications'
import { useAuth } from '@/hooks/use-auth'

export function LogsTab() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null)

  useEffect(() => {
    if (user) loadLogs()
  }, [user])

  const loadLogs = async () => {
    setIsLoading(true)
    const { data } = await fetchLogs(user!.id)
    if (data) setLogs(data)
    setIsLoading(false)
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
                <TableHead className="text-muted-foreground">Destinatário</TableHead>
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
                  <TableCell className="text-sm text-white font-medium">{log.recipient}</TableCell>
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
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="w-4 h-4 mr-2" /> Ver
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
