import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Check, X, Send, Activity } from 'lucide-react'
import { toast } from 'sonner'
import useAppStore from '@/stores/main'

export default function AdminPage() {
  const { logs } = useAppStore()

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
      type: 'Lembrete de Visita',
      status: 'Enviado',
      time: '10 min atrás',
    },
    {
      id: 2,
      to: 'Maria Santos',
      type: 'Alerta de Novo Match',
      status: 'Lido',
      time: '1 hora atrás',
    },
    { id: 3, to: 'Carlos Mendes', type: 'Boas-vindas', status: 'Pendente', time: '2 horas atrás' },
  ]

  const handleAction = (name: string, action: 'approved' | 'rejected') => {
    toast.success(
      action === 'approved'
        ? `Solicitação de ${name} aprovada. E-mail de boas-vindas na fila.`
        : `Solicitação de ${name} rejeitada. E-mail de feedback enviado.`,
    )
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
            value="logs"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-2 px-4"
          >
            Logs de Atividade
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
                    onClick={() => handleAction(req.name, 'rejected')}
                  >
                    <X className="w-4 h-4 mr-2" /> Rejeitar
                  </Button>
                  <Button
                    className="flex-1 md:flex-none bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none"
                    onClick={() => handleAction(req.name, 'approved')}
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
