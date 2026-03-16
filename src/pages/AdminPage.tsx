import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const requests = [
    { id: 1, name: 'Carlos Mendes', email: 'carlos@mendes.com', creci: '12345-RJ', ticket: '3M' },
    { id: 2, name: 'Ana Souza', email: 'ana@souza.com', creci: '54321-RJ', ticket: '5M' },
  ]

  const handleAction = (name: string, action: 'approved' | 'rejected') => {
    toast(
      action === 'approved'
        ? `Solicitação de ${name} aprovada.`
        : `Solicitação de ${name} rejeitada.`,
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
        <TabsList className="bg-card border border-border w-full justify-start rounded-none sm:rounded-lg overflow-x-auto">
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
            Waitlist
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary"
          >
            Revisão Quinzenal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6 space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="bg-secondary border-border">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${req.id}`} />
                    <AvatarFallback>{req.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{req.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {req.email} • CRECI: {req.creci}
                    </p>
                    <p className="text-xs text-primary mt-1">Ticket: R$ {req.ticket}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none border-red-500/50 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleAction(req.name, 'rejected')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    className="flex-1 sm:flex-none bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none"
                    onClick={() => handleAction(req.name, 'approved')}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="waitlist" className="mt-6">
          <Card className="bg-secondary border-border text-center py-12">
            <p className="text-muted-foreground">Fila de espera vazia no momento.</p>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">Matches Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">142</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">Novos Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">12</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">VGV Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">R$ 45M</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
