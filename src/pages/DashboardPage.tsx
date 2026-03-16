import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Activity, GitMerge, Home, Search, AlertCircle, Copy, Crown } from 'lucide-react'
import useAppStore from '@/stores/main'
import { useToast } from '@/hooks/use-toast'

export default function DashboardPage() {
  const { user, listings, needs, matches } = useAppStore()
  const { toast } = useToast()

  const myListings = listings.filter((l) => l.ownerId === user?.id).length
  const activeMatches = matches.filter((m) => m.status !== 'Fechado').length

  const referralLink = `${window.location.origin}/apply?ref=${user?.id || 'founder-123'}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: 'Link copiado!',
      description: 'Envie este link para convidar parceiros para a rede.',
    })
  }

  const stats = [
    { title: 'Demandas Ativas', value: needs.length.toString(), icon: Search, trend: '+2 hoje' },
    { title: 'Meus Imóveis', value: myListings.toString(), icon: Home, trend: 'Visualizações ↑' },
    {
      title: 'Conexões em Aberto',
      value: activeMatches.toString(),
      icon: GitMerge,
      trend: '3 Aguardando',
    },
    { title: 'Fechamentos', value: 'R$ 0', icon: Activity, trend: 'Este mês' },
  ]

  const activities = [
    { text: 'Maria Santos cadastrou uma nova demanda de Cobertura.', time: 'Há 2 horas' },
    { text: 'Seu imóvel "Mansão Jardim Oceânico" recebeu 5 visualizações.', time: 'Há 4 horas' },
    { text: 'Carlos propôs parceria em "Casa Cond. Santa Mônica".', time: 'Ontem' },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Alert className="bg-card border-primary/20 text-foreground shadow-[0_0_15px_rgba(201,168,76,0.1)]">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-semibold ml-2">
          Política de Engajamento e Exclusão
        </AlertTitle>
        <AlertDescription className="text-muted-foreground mt-2 ml-2 leading-relaxed">
          O acesso contínuo à plataforma depende da sua adoção ativa das ferramentas e alto nível de
          comprometimento. A inatividade prolongada ou conduta fora dos padrões resultará em
          exclusão da rede para proteger os membros ativos.
          <strong className="text-foreground block mt-2 font-medium">
            Essa é uma das condições de acesso, para que se evite surpresas com negociações 2/2/1
            não mencionadas antes.
          </strong>
        </AlertDescription>
      </Alert>

      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Bem-vindo, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-muted-foreground mt-2">
          Aqui está o resumo do seu círculo na Barra da Tijuca.
        </p>
      </div>

      {/* Referral Section for Founder Brokers */}
      <Card className="bg-card border-primary/30 shadow-[0_0_30px_rgba(201,168,76,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Crown className="w-6 h-6" />
            Seu Caminho até a Elite: Indique um Parceiro
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground max-w-2xl">
            Nesta fase inicial, o crescimento da rede é orgânico e curado. Compartilhe seu link
            exclusivo para convidar corretores de alto padrão. Parceiros indicados por você têm{' '}
            <strong>acesso imediato</strong> à plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mt-2 relative z-10">
            <Input
              readOnly
              value={referralLink}
              className="bg-background/80 border-primary/20 text-muted-foreground font-mono h-12 flex-1 focus-visible:ring-primary"
            />
            <Button
              onClick={copyLink}
              size="lg"
              className="gold-gradient text-black font-semibold h-12 shadow-[0_0_15px_rgba(201,168,76,0.2)] hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Feed de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{act.text}</p>
                  <p className="text-xs text-muted-foreground">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
