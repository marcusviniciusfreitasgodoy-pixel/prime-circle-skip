import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { simulateBiWeeklyReview } from '@/lib/email'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { UsersManagementTab } from '@/components/admin/UsersManagementTab'

interface SupportTicket {
  id: string
  user_id: string | null
  full_name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function AdminPage() {
  const { suggestions, statusLogs, updateSuggestionStatus, enforceInactivity } = useAppStore()
  const { user: authUser } = useAuth()

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [profiles, setProfiles] = useState<any[]>([])

  const pendingProfiles = profiles.filter((p) => p.status === 'pending_validation')

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })

    if (!error && data) {
      setProfiles(data)
    }
  }

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('support_tickets' as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setTickets(data)
      }
    }

    fetchTickets()
    fetchProfiles()
  }, [])

  const handleAction = async (id: string, name: string, action: 'active' | 'rejected') => {
    const updates: any = { status: action }
    if (action === 'active') {
      updates.validated_by = authUser?.id
      updates.validation_date = new Date().toISOString()
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', id)

    if (!error) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, status: action } : p)))
      if (action === 'active') {
        toast.success('Aprovado via Revisão Manual.')
      } else {
        toast.error('Candidato rejeitado.')
      }
    } else {
      toast.error('Erro ao atualizar status.')
    }
  }

  const handleTicketStatusChange = async (ticketId: string, newStatus: string) => {
    const { error } = await supabase
      .from('support_tickets' as any)
      .update({ status: newStatus })
      .eq('id', ticketId)

    if (!error) {
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)))
      toast.success('Status do chamado atualizado.')
    } else {
      toast.error('Erro ao atualizar status do chamado.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Governança & Admin</h2>
        <p className="text-muted-foreground text-sm">
          Revisão manual, logs de status, chamados e monitoramento.
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="bg-card border border-border flex-wrap justify-start h-auto p-1 gap-1">
          <TabsTrigger value="requests" className="data-[state=active]:bg-secondary">
            Revisão Manual ({pendingProfiles.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-secondary">
            Todos os Usuários
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-secondary">
            Chamados
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-secondary">
            Sugestões
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-secondary">
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-secondary">
            Trilha de Auditoria
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
              Executar Cron
            </Button>
          </div>
          {pendingProfiles.map((req) => (
            <Card
              key={req.id}
              className="bg-secondary border-border border-l-4 border-l-yellow-500/50"
            >
              <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <Avatar>
                    <AvatarImage src={req.avatar_url} />
                    <AvatarFallback>
                      {req.full_name ? req.full_name[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{req.full_name || 'Sem Nome'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Contato: {req.whatsapp_number || 'N/A'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="border-border">
                        CRECI: {req.creci || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="border-border">
                        Região: {req.region || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleAction(req.id, req.full_name, 'rejected')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    className="flex-1 bg-green-500/20 text-green-500 hover:bg-green-500/30"
                    onClick={() => handleAction(req.id, req.full_name, 'active')}
                  >
                    <Check className="w-4 h-4 mr-2" /> Aprovar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingProfiles.length === 0 && (
            <p className="text-muted-foreground">Nenhuma solicitação pendente de revisão.</p>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-4">
          <UsersManagementTab
            profiles={profiles}
            refetchProfiles={fetchProfiles}
            authUser={authUser}
          />
        </TabsContent>

        <TabsContent value="tickets" className="mt-6 space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="bg-secondary border-border">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      De: <span className="text-white">{ticket.full_name}</span> ({ticket.email})
                    </p>
                  </div>
                  <Select
                    value={ticket.status}
                    onValueChange={(val) => handleTicketStatusChange(ticket.id, val)}
                  >
                    <SelectTrigger
                      className={cn(
                        'w-[160px] h-9 text-xs border font-medium transition-colors',
                        ticket.status === 'open' &&
                          'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
                        ticket.status === 'pending' &&
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
                        ticket.status === 'resolved' &&
                          'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
                        !['open', 'pending', 'resolved'].includes(ticket.status) &&
                          'bg-background border-border text-white',
                      )}
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-background/50 p-4 rounded-md text-sm text-muted-foreground whitespace-pre-wrap border border-border/50">
                  {ticket.message}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Recebido em: {new Date(ticket.created_at).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
          {tickets.length === 0 && (
            <div className="p-8 text-center bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Nenhum chamado de suporte registrado.</p>
            </div>
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
              <CardTitle className="text-lg text-white">
                Status Logs (Trilha de Auditoria)
              </CardTitle>
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
