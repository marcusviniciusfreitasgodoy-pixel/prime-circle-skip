import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Activity, GitMerge, Home, Search, AlertCircle } from 'lucide-react'
import useAppStore from '@/stores/main'

export default function DashboardPage() {
  const { user, listings, needs, matches } = useAppStore()

  const myListings = listings.filter((l) => l.ownerId === user?.id).length
  const activeMatches = matches.filter((m) => m.status !== 'Fechado').length

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
