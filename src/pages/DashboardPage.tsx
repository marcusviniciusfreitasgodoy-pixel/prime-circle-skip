import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AmbassadorWidget } from '@/components/AmbassadorWidget'
import { FounderExpiryBanner } from '@/components/FounderExpiryBanner'
import {
  Activity,
  GitMerge,
  Home,
  Search,
  AlertCircle,
  Copy,
  Crown,
  ChevronRight,
} from 'lucide-react'
import useAppStore from '@/stores/main'
import { useToast } from '@/hooks/use-toast'

export default function DashboardPage() {
  const { user, listings, needs, matches, updateMatchStatus, suggestions, updateSuggestionStatus } =
    useAppStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Demo: Automatically approve a specific pending suggestion to show the notification AC working end-to-end
  useEffect(() => {
    const pendingSug = suggestions.find((s) => s.id === '2' && s.status === 'Pendente')
    if (pendingSug && user?.id === 'user1') {
      const timer = setTimeout(() => {
        updateSuggestionStatus('2', 'Implementado')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [suggestions, user?.id, updateSuggestionStatus])

  // Chapter Isolation Enforced: Only see data from the same chapter
  const chapterListings = listings.filter((l) => l.chapter === user?.chapter)
  const chapterNeeds = needs.filter((n) => n.chapter === user?.chapter)

  const myListings = chapterListings.filter((l) => l.ownerId === user?.id).length
  const activeMatches = matches.filter((m) => m.status !== 'Fechado')

  const referralLink = `${window.location.origin}/apply?ref=${user?.id || 'founder-123'}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: 'Link copiado!',
      description:
        'Envie este link para convidar parceiros e subir de nível no Ambassador Program.',
    })
  }

  const stats = [
    {
      title: 'Demandas do Círculo',
      value: chapterNeeds.length.toString(),
      icon: Search,
      trend: 'Acesso Isolado',
    },
    {
      title: 'Meus Imóveis Ativos',
      value: myListings.toString(),
      icon: Home,
      trend: `Plano: ${user?.plan}`,
    },
    {
      title: 'Conexões Abertas',
      value: activeMatches.length.toString(),
      icon: GitMerge,
      trend: 'Aguardando ação',
    },
    {
      title: 'Fechamentos Validados',
      value: matches.filter((m) => m.status === 'Fechado').length.toString(),
      icon: Activity,
      trend: 'Este mês',
    },
  ]

  const MATCH_STAGES = ['Novo', 'Contato', 'Visita', 'Proposta', 'Fechado'] as const

  const advanceMatch = (id: string, currentStatus: string) => {
    const idx = MATCH_STAGES.indexOf(currentStatus as any)
    if (idx < MATCH_STAGES.length - 2) {
      updateMatchStatus(id, MATCH_STAGES[idx + 1])
      toast({
        title: 'Status Atualizado',
        description: `Conexão avançou para ${MATCH_STAGES[idx + 1]}`,
      })
    } else if (idx === MATCH_STAGES.length - 2) {
      navigate(`/matches/${id}/close`)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <FounderExpiryBanner />

      <Alert className="bg-card border-primary/20 text-foreground shadow-[0_0_15px_rgba(201,168,76,0.1)]">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-semibold ml-2">
          Chapter {user?.chapter} — Engajamento Exigido
        </AlertTitle>
        <AlertDescription className="text-muted-foreground mt-2 ml-2 leading-relaxed">
          Seu acesso e status de Embaixador dependem de atividade constante na plataforma. A
          inatividade superior a 30 dias gerará avisos, podendo resultar em suspensão do plano.
          <strong className="text-foreground block mt-1 font-medium">
            Lembre-se: Prática obrigatória de 50/50 em todas as conexões.
          </strong>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Dashboard, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-muted-foreground mt-2">
            Plano atual:{' '}
            <Badge variant="outline" className="border-primary/50 text-primary">
              {user?.plan}
            </Badge>
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card border-primary/30 shadow-[0_0_30px_rgba(201,168,76,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                <Crown className="w-6 h-6" /> Indique Parceiros
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground max-w-2xl">
                Convide corretores alinhados à política 50/50 e receba meses grátis. Parceiros com
                seu código têm prioridade na análise.
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
                  className="gold-gradient text-black font-semibold h-12 shadow-[0_0_15px_rgba(201,168,76,0.2)]"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copiar Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div className="md:col-span-1">
          <AmbassadorWidget tier={user?.tier || 'None'} referrals={user?.referrals} />
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Pipeline de Conexões (Matches)</CardTitle>
          <CardDescription>Fluxo de validação obrigatório até o fechamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {matches.map((match) => {
              const need = needs.find((n) => n.id === match.needId)
              const listing = listings.find((l) => l.id === match.listingId)
              const currentIdx = MATCH_STAGES.indexOf(match.status as any)

              return (
                <div key={match.id} className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white font-medium">
                        {need?.title} <span className="text-muted-foreground mx-2">↔</span>{' '}
                        {listing?.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Conexão ID: {match.id}</p>
                    </div>
                    {match.status !== 'Fechado' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/50 text-primary hover:bg-primary/10"
                        onClick={() => advanceMatch(match.id, match.status)}
                      >
                        {match.status === 'Proposta' ? 'Registrar Fechamento' : 'Avançar Status'}{' '}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-500 border-none hover:bg-green-500/30">
                        Fechamento Validado
                      </Badge>
                    )}
                  </div>
                  {/* Visual Funnel */}
                  <div className="flex items-center w-full justify-between mt-6 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                      style={{ width: `${(currentIdx / (MATCH_STAGES.length - 1)) * 100}%` }}
                    />

                    {MATCH_STAGES.map((stage, i) => (
                      <div key={stage} className="relative z-10 flex flex-col items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-colors ${i <= currentIdx ? 'bg-primary border-primary' : 'bg-background border-border'} ${i === currentIdx ? 'shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-125' : ''}`}
                        />
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider absolute top-6 whitespace-nowrap ${i <= currentIdx ? 'text-white' : 'text-muted-foreground'}`}
                        >
                          {stage}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="h-4" /> {/* Spacer for labels */}
                </div>
              )
            })}
            {matches.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma conexão ativa no momento.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
