import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import useAppStore, { SuggestionStatus } from '@/stores/main'
import { sendTransactionalEmail, simulateBiWeeklyReview } from '@/lib/email'

export default function AdminPage() {
  const {
    candidates,
    suggestions,
    statusLogs,
    approveCandidate,
    rejectCandidate,
    updateSuggestionStatus,
    enforceInactivity,
  } = useAppStore()
  const pendingRequests = candidates.filter((c) => c.status === 'pending')

  const handleAction = async (
    id: string,
    email: string,
    name: string,
    action: 'approved' | 'rejected',
  ) => {
    if (action === 'approved') {
      approveCandidate(id)
      await sendTransactionalEmail('member_approved', { to: email, name })
      toast.success('Aprovado via Review Manual.')
    } else {
      rejectCandidate(id)
      toast.error('Candidato rejeitado.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Governança & Admin</h2>
        <p className="text-muted-foreground text-sm">
          Review manual, logs de status, sugestões e monitoramento.
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="bg-card border border-border flex-wrap justify-start h-auto p-1 gap-1">
          <TabsTrigger value="requests" className="data-[state=active]:bg-secondary">
            Manual Review ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-secondary">
            Sugestões
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-secondary">
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-secondary">
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6 space-y-4">
          <div className="flex justify-between items-center p-4 bg-card rounded-lg border border-border mb-4">
            <span className="text-muted-foreground text-sm">
              Validação automática quinzenal ativada (20 dias pendentes).
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                simulateBiWeeklyReview()
                toast.success('Cron processado.')
              }}
            >
              Rodar Cron
            </Button>
          </div>
          {pendingRequests.map((req) => (
            <Card
              key={req.id}
              className="bg-secondary border-border border-l-4 border-l-yellow-500/50"
            >
              <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <Avatar>
                    <AvatarFallback>{req.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{req.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {req.email} • {req.phone}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="border-border">
                        CRECI: {req.creci}
                      </Badge>
                      <Badge variant="outline" className="border-border">
                        Região: {req.region}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleAction(req.id, req.email, req.name, 'rejected')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    className="flex-1 bg-green-500/20 text-green-500 hover:bg-green-500/30"
                    onClick={() => handleAction(req.id, req.email, req.name, 'approved')}
                  >
                    <Check className="w-4 h-4 mr-2" /> Aprovar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingRequests.length === 0 && (
            <p className="text-muted-foreground">Nenhuma solicitação pendente de revisão.</p>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6 space-y-4">
          {suggestions.map((sug) => (
            <Card key={sug.id} className="bg-secondary border-border">
              <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="bg-background border-border text-[10px] text-muted-foreground"
                    >
                      {sug.category || 'Geral'}
                    </Badge>
                    <h3 className="font-semibold text-white">{sug.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{sug.desc}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <Select
                    value={sug.status}
                    onValueChange={(val) => {
                      updateSuggestionStatus(sug.id, val as SuggestionStatus)
                      if (val === 'Entregue')
                        toast.success('Sugestão implementada! Autor recompensado com 1 mês extra.')
                      else toast.success(`Status alterado para ${val}.`)
                    }}
                  >
                    <SelectTrigger className="w-[160px] bg-background border-border text-xs text-white h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Em Análise">Em Análise</SelectItem>
                      <SelectItem value="Em Desenvolvimento">Em Desenvolvimento</SelectItem>
                      <SelectItem value="Entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="mt-6 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Status Logs (Traceability)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...statusLogs]
                .reverse()
                .slice(0, 20)
                .map((log, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded bg-background border border-border text-sm"
                  >
                    <div>
                      <span className="font-mono text-xs text-muted-foreground mr-3">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <strong className="text-white uppercase mr-2">{log.entity}</strong>
                      <span className="text-muted-foreground">
                        mudou de{' '}
                        <Badge variant="outline" className="text-[10px]">
                          {log.oldStatus || 'None'}
                        </Badge>{' '}
                        para{' '}
                        <Badge className="text-[10px] bg-primary/20 text-primary hover:bg-primary/20">
                          {log.newStatus}
                        </Badge>
                      </span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-card rounded-lg border border-border text-muted-foreground text-sm gap-4">
            <p>
              Monitoramento automático ativado. Inatividade &gt; 30 dias notifica, &gt; 60 dias
              suspende benefícios Ambassador.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                enforceInactivity()
                toast.success('Regras de inatividade aplicadas (Simulação de 60 dias).')
              }}
            >
              Forçar Suspensão (Teste)
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
