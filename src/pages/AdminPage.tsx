import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Check, X, Send, Activity, Zap } from 'lucide-react'
import { toast } from 'sonner'
import useAppStore from '@/stores/main'
import {
  simulateInactivityReminders,
  simulateBiWeeklyReport,
  sendTransactionalEmail,
} from '@/lib/email'

export default function AdminPage() {
  const { logs, logEvent } = useAppStore()

  const requests = [
    {
      id: 1,
      name: 'Carlos Mendes',
      email: 'carlos@mendes.com',
      creci: '12345-RJ',
      ticket: '3M',
      phone: '(21) 99999-1111',
    },
    {
      id: 2,
      name: 'Ana Souza',
      email: 'ana@souza.com',
      creci: '54321-RJ',
      ticket: '5M',
      phone: '(21) 98888-2222',
    },
  ]

  const mockComms = [
    {
      id: 1,
      to: 'João Corretor',
      type: 'Lembrete de Inatividade (14 dias)',
      status: 'Enviado',
      time: '10 min atrás',
    },
    {
      id: 2,
      to: 'Maria Santos',
      type: 'Report Quinzenal',
      status: 'Lido',
      time: '1 hora atrás',
    },
    {
      id: 3,
      to: 'Carlos Mendes',
      type: 'Boas-vindas',
      status: 'Pendente',
      time: '2 horas atrás',
    },
  ]

  const handleAction = async (name: string, email: string, action: 'approved' | 'rejected') => {
    if (action === 'approved') {
      toast.success(`Solicitação de ${name} aprovada. Enviando link mágico...`)
      await sendTransactionalEmail('Magic Link Email', { to: email, name })
      logEvent('Aprovação de Usuário', `O candidato ${name} foi aprovado.`)
    } else {
      toast.error(`Solicitação de ${name} rejeitada. E-mail de feedback enviado.`)
      await sendTransactionalEmail('Rejection Feedback', { to: email, name })
      logEvent('Rejeição de Usuário', `O candidato ${name} foi rejeitado.`)
    }
  }

  const handleTriggerInactivity = () => {
    simulateInactivityReminders()
    toast.success('Job de inatividade executado. Notificações na fila.')
    logEvent('Cron Job', 'Verificação de inatividade de 14 dias disparada manualmente.')
  }

  const handleTriggerReport = () => {
    simulateBiWeeklyReport()
    toast.success('Report Quinzenal gerado e enviado aos membros ativos.')
    logEvent('Cron Job', 'Report quinzenal de inteligência de mercado disparado manualmente.')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
        <p className="text-muted-foreground text-sm">
          Gerencie o acesso e acompanhe a saúde do ecossistema.
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start rounded-none sm:rounded-lg overflow-x-auto h-auto p-1">
          <TabsTrigger
            value="requests"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-2 px-4"
          >
            Solicitações
          </TabsTrigger>
          <TabsTrigger
            value="comms"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-2 px-4"
          >
            Comunicações
          </TabsTrigger>
          <TabsTrigger
            value="automations"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-2 px-4"
          >
            Automações
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-2 px-4"
          >
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6 space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="bg-secondary border-border">
              <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${req.id}`} />
                    <AvatarFallback>{req.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{req.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {req.email} • {req.phone}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        CRECI: {req.creci}
                      </Badge>
                      <Badge variant="outline" className="border-border text-white">
                        Ticket: R$ {req.ticket}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none border-red-500/50 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleAction(req.name, req.email, 'rejected')}
                  >
                    <X className="w-4 h-4 mr-2" /> Rejeitar
                  </Button>
                  <Button
                    className="flex-1 md:flex-none bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none"
                    onClick={() => handleAction(req.name, req.email, 'approved')}
                  >
                    <Check className="w-4 h-4 mr-2" /> Aprovar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="comms" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> Monitor de Transacionais
              </CardTitle>
              <CardDescription>
                Status dos e-mails e notificações automatizadas do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockComms.map((comm) => (
                  <div
                    key={comm.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-background border border-border"
                  >
                    <div>
                      <p className="text-white font-medium">{comm.type}</p>
                      <p className="text-sm text-muted-foreground">Para: {comm.to}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          comm.status === 'Lido'
                            ? 'border-green-500 text-green-500'
                            : comm.status === 'Enviado'
                              ? 'border-primary text-primary'
                              : 'border-gray-500 text-gray-500'
                        }
                      >
                        {comm.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{comm.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> Disparos Manuais (Cron Jobs)
              </CardTitle>
              <CardDescription>
                Simule o comportamento dos cron jobs de engajamento do ecossistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-secondary rounded-lg border border-border gap-4">
                <div>
                  <h4 className="text-white font-medium">Lembretes de Inatividade</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gatilho automático de e-mail para membros que não logaram ou atualizaram
                    demandas nos últimos 14 dias.
                  </p>
                </div>
                <Button
                  onClick={handleTriggerInactivity}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 shrink-0"
                >
                  Disparar Verificação
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-secondary rounded-lg border border-border gap-4">
                <div>
                  <h4 className="text-white font-medium">Report Quinzenal (Newsletter)</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dispara o e-mail de resumo de mercado para todos os membros ativos com os
                    últimos imóveis e demandas curadas.
                  </p>
                </div>
                <Button
                  onClick={handleTriggerReport}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 shrink-0"
                >
                  Gerar Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Eventos do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum evento registrado nesta sessão.
                </p>
              ) : (
                <div className="space-y-4">
                  {[...logs].reverse().map((log, i) => (
                    <div
                      key={i}
                      className="flex flex-col p-3 rounded-lg bg-background border border-border"
                    >
                      <span className="text-primary text-sm font-semibold">{log.action}</span>
                      <span className="text-white text-sm mt-1">{log.details}</span>
                      <span className="text-xs text-muted-foreground mt-2">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
