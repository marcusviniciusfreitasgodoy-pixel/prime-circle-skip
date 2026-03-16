import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Check, X, Send, Activity, Zap, Mail, Trophy } from 'lucide-react'
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
  ]

  const waitlist = [
    {
      id: 3,
      name: 'Lucas Pereira',
      email: 'lucas@pereira.com',
      ticket: '800k',
      region: 'Zona Sul',
    },
    {
      id: 4,
      name: 'Fernanda Costa',
      email: 'fernanda@costa.com',
      ticket: '900k',
      region: 'Recreio',
    },
  ]

  const suggestionsMock = [
    {
      id: 1,
      title: 'Filtro por Condomínio',
      author: 'João Corretor',
      votes: 12,
      status: 'Planejado',
    },
    {
      id: 2,
      title: 'Integração RD Station',
      author: 'Maria Santos',
      votes: 8,
      status: 'Em Análise',
    },
  ]

  const handleAction = async (name: string, email: string, action: 'approved' | 'rejected') => {
    if (action === 'approved') {
      toast.success(`Solicitação de ${name} aprovada. Enviando e-mails...`)
      await sendTransactionalEmail('Welcome Email', { to: email, name })
      logEvent('Aprovação de Usuário', `O candidato ${name} foi aprovado.`)
    } else {
      toast.error(`Solicitação de ${name} rejeitada.`)
      logEvent('Rejeição de Usuário', `O candidato ${name} foi rejeitado.`)
    }
  }

  const handleBulkInvite = () => {
    toast.success('Convites em massa enviados para a lista de espera!')
    logEvent('Admin Action', 'Bulk invite enviado para waitlist.')
  }

  const handleReward = (member: string) => {
    toast.success(`Recompensa (1 mês grátis) creditada para ${member}!`)
    logEvent('Admin Action', `Recompensa de sugestão concedida a ${member}.`)
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
        <p className="text-muted-foreground text-sm">
          Gerencie o acesso e acompanhe a saúde do ecossistema.
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="bg-card border border-border w-full flex-wrap justify-start rounded-none sm:rounded-lg h-auto p-1 gap-1">
          <TabsTrigger
            value="requests"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            Solicitações
          </TabsTrigger>
          <TabsTrigger
            value="waitlist"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            Lista de Espera
          </TabsTrigger>
          <TabsTrigger
            value="suggestions"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            Sugestões
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            Review Quinzenal
          </TabsTrigger>
          <TabsTrigger
            value="comms"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            Comms
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
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

        <TabsContent value="waitlist" className="mt-6 space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border mb-4">
            <div>
              <h3 className="text-white font-medium">Fila de Espera</h3>
              <p className="text-sm text-muted-foreground">
                {waitlist.length} corretores aguardando liberação regional.
              </p>
            </div>
            <Button onClick={handleBulkInvite} className="gold-gradient text-black">
              <Mail className="w-4 h-4 mr-2" /> Disparar Convites
            </Button>
          </div>
          {waitlist.map((req) => (
            <Card
              key={req.id}
              className="bg-secondary border-border opacity-80 hover:opacity-100 transition-opacity"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{req.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {req.email} • {req.region}
                  </p>
                </div>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  Ticket: {req.ticket}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6 space-y-4">
          {suggestionsMock.map((sug) => (
            <Card key={sug.id} className="bg-secondary border-border">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{sug.title}</h3>
                    <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
                      {sug.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Por: {sug.author} • {sug.votes} Votos
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10 shrink-0"
                  onClick={() => handleReward(sug.author)}
                >
                  <Trophy className="w-4 h-4 mr-2" /> Recompensar
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Saúde da Plataforma
              </CardTitle>
              <CardDescription>Métricas quinzenais de adoção e liquidez.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Novos Membros</p>
                  <p className="text-2xl font-bold text-white">+12</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Matches Ativos</p>
                  <p className="text-2xl font-bold text-primary">45</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">VGV Fechado</p>
                  <p className="text-2xl font-bold text-white">R$ 15M</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Conversão</p>
                  <p className="text-2xl font-bold text-white">18%</p>
                </div>
              </div>
              <Button
                className="w-full sm:w-auto mt-4 border-border text-muted-foreground bg-background"
                variant="outline"
                onClick={() => {
                  simulateBiWeeklyReport()
                  toast.success('Report Gerado')
                }}
              >
                Gerar Report e Enviar Lembretes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comms" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> Transacionais Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-background border border-border">
                  <div>
                    <p className="text-white font-medium text-sm">
                      Lembrete de Inatividade (14 dias)
                    </p>
                    <p className="text-xs text-muted-foreground">Para: João Corretor</p>
                  </div>
                  <Badge variant="outline" className="border-primary text-primary">
                    Enviado
                  </Badge>
                </div>
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
              <div className="space-y-3">
                {[...logs].reverse().map((log, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-3 rounded-lg bg-background border border-border"
                  >
                    <span className="text-primary text-sm font-semibold">{log.action}</span>
                    <span className="text-white text-sm mt-1">{log.details}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
