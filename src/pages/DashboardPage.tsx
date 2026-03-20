import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AmbassadorWidget } from '@/components/AmbassadorWidget'
import { FounderExpiryBanner } from '@/components/FounderExpiryBanner'
import { PortfolioTabs } from '@/components/dashboard/PortfolioTabs'
import { AddPropertyDialog } from '@/components/dashboard/AddPropertyDialog'
import { OpportunityRadar } from '@/components/dashboard/OpportunityRadar'
import { PendingValidations } from '@/components/dashboard/PendingValidations'
import { ReputationRanking } from '@/components/dashboard/ReputationRanking'
import { ReferralTracker } from '@/components/dashboard/ReferralTracker'
import { DeliveryStatusWidget } from '@/components/dashboard/DeliveryStatusWidget'
import { PwaInstallPrompt } from '@/components/dashboard/PwaInstallPrompt'
import { MatchesChartWidget } from '@/components/dashboard/MatchesChartWidget'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Activity,
  GitMerge,
  Home,
  Search,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  BellRing,
} from 'lucide-react'
import useAppStore from '@/stores/main'
import type { Tier, Plan } from '@/stores/main'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export default function DashboardPage() {
  const { user, listings, needs, matches, updateMatchStatus, updateUser } = useAppStore()
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [profileName, setProfileName] = useState<string>('')
  const [profileAvatar, setProfileAvatar] = useState<string>('')
  const [profileScore, setProfileScore] = useState<number>(0)
  const [profileStatus, setProfileStatus] = useState<string>('active')
  const [profilePlan, setProfilePlan] = useState<string>('Free')
  const [profileReferralCode, setProfileReferralCode] = useState<string>('')
  const [isLoadingName, setIsLoadingName] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [recentMatchAlerts, setRecentMatchAlerts] = useState<any[]>([])
  const [referralsCount, setReferralsCount] = useState<number>(0)
  const [userTier, setUserTier] = useState<Tier>('None')

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1)

  useEffect(() => {
    let mounted = true

    const fetchProfileData = async () => {
      if (!authUser) {
        setIsLoadingName(false)
        return
      }

      setIsLoadingName(true)

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, reputation_score, status, avatar_url, plan, referral_code')
          .eq('id', authUser.id)
          .single()

        if (!mounted) return

        if (!error && data) {
          setProfileName(data.full_name || authUser.email || 'Usuário')

          // Improved fallback for avatar
          const avatar =
            data.avatar_url ||
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture ||
            ''
          setProfileAvatar(avatar)

          setProfileScore(data.reputation_score || 0)
          setProfileStatus(data.status || 'active')
          setProfilePlan(data.plan || 'Free')
          setProfileReferralCode(data.referral_code || '')

          const storeUpdates: any = {}
          if (avatar && avatar !== user?.avatar) {
            storeUpdates.avatar = avatar
          }
          if (data.plan && data.plan !== user?.plan) {
            storeUpdates.plan = data.plan as Plan
          }

          if (Object.keys(storeUpdates).length > 0) {
            updateUser(storeUpdates)
          }
        } else {
          setProfileName(authUser.email || 'Usuário')
          if (error) console.warn('Error fetching profile:', error)
        }
      } catch (err) {
        console.warn('Exception fetching profile data:', err)
        if (mounted) setProfileName(authUser.email || 'Usuário')
      }

      try {
        const { data: refData, error: countError } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', authUser.id)
          .eq('status', 'active')

        if (countError) {
          console.warn('Error fetching referrals count:', countError)
        } else if (mounted && refData) {
          const count = refData.length
          setReferralsCount(count)
          let tier: Tier = 'None'
          if (count >= 99) tier = 'Elite+'
          else if (count >= 15) tier = 'Elite'
          else if (count >= 10) tier = 'Gold'
          else if (count >= 7) tier = 'Silver'
          else if (count >= 5) tier = 'Ambassador'
          setUserTier(tier)
          updateUser({ tier, referrals: count })
        }
      } catch (err) {
        console.warn('Exception during referral count fetch handled gracefully:', err)
      }

      setIsLoadingName(false)

      try {
        const { data: alerts, error: alertsError } = await supabase
          .from('notification_logs')
          .select('id, message_body, created_at')
          .eq('user_id', authUser.id)
          .eq('channel', 'whatsapp')
          .ilike('message_body', '%match perfeito%')
          .order('created_at', { ascending: false })
          .limit(3)

        if (!mounted) return
        if (alertsError) {
          console.warn('Error fetching alerts:', alertsError)
        } else if (alerts) {
          setRecentMatchAlerts(alerts)
        }
      } catch (err) {
        console.warn('Exception fetching alerts:', err)
      }
    }

    fetchProfileData()

    return () => {
      mounted = false
    }
  }, [authUser])

  const chapterListings = listings.filter((l) => l.chapter === user?.chapter)
  const chapterNeeds = needs.filter((n) => n.chapter === user?.chapter)
  const myListings = chapterListings.filter((l) => l.ownerId === user?.id).length
  const activeMatches = matches.filter((m) => m.status !== 'Fechado')

  const refCode = profileReferralCode || authUser?.id || user?.id || 'founder-123'
  const referralLink = `https://www.primecircle.app.br/apply?ref=${refCode}`

  const formatPlanName = (plan: string) => {
    if (plan === 'Founder') return 'Fundador'
    if (plan === 'Free') return 'Gratuito'
    return plan
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
      trend: `Plano: ${formatPlanName(profilePlan)}`,
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
      <PwaInstallPrompt />
      <FounderExpiryBanner />

      {profileStatus === 'pending_validation' && (
        <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold ml-2">Conta em Processo de Curadoria</AlertTitle>
          <AlertDescription className="mt-2 ml-2">
            Sua conta está em processo de curadoria. Aguarde a validação de um membro sênior ou da
            administração. Algumas funções podem estar restritas.
          </AlertDescription>
        </Alert>
      )}

      <PendingValidations />

      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/50 shadow-md">
            {profileAvatar && <AvatarImage src={profileAvatar} />}
            <AvatarFallback className="bg-secondary text-muted-foreground text-xl">
              {profileName ? profileName.substring(0, 2).toUpperCase() : 'US'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center flex-wrap gap-2 min-h-9">
              Bem-vindo,{' '}
              {isLoadingName ? <Skeleton className="h-8 w-32 bg-muted/20" /> : profileName}
              {!isLoadingName && profileScore > 80 && (
                <Badge className="ml-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3" /> Status de Elite
                </Badge>
              )}
            </h2>
            <div className="text-muted-foreground mt-2 flex items-center flex-wrap gap-3">
              <span>
                Plano atual:{' '}
                <Badge variant="outline" className="border-primary/50 text-primary font-semibold">
                  {isLoadingName ? (
                    <Skeleton className="h-4 w-16 bg-muted/20 inline-block" />
                  ) : (
                    formatPlanName(profilePlan)
                  )}
                </Badge>
              </span>
              <span className="text-sm border-l border-border pl-3 flex items-center gap-1">
                Pontuação PrimeCircle:{' '}
                <strong
                  className={`text-white px-2 py-0.5 rounded-md border border-border ${profileScore > 80 ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-secondary/80'}`}
                >
                  {isLoadingName ? '-' : profileScore}
                </strong>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AddPropertyDialog onSuccess={triggerRefresh} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <PortfolioTabs refreshKey={refreshKey} />
        </div>
        <div className="md:col-span-1 flex flex-col gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" /> Meus Alertas de Conexão
              </CardTitle>
              <CardDescription>Avisos enviados via WhatsApp recentemente</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMatchAlerts.length > 0 ? (
                <div className="space-y-4">
                  {recentMatchAlerts.map((alert) => {
                    const matchText = alert.message_body.match(
                      /match perfeito para sua demanda: (.*?)\. Confira/,
                    )
                    const excerpt = matchText ? matchText[1] : 'Nova oportunidade identificada!'

                    return (
                      <div
                        key={alert.id}
                        className="p-3 bg-secondary/30 rounded-lg border border-border/50 border-l-2 border-l-primary flex flex-col gap-1"
                      >
                        <span className="text-sm font-medium text-white line-clamp-2">
                          {excerpt}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nenhum alerta recente. Cadastre novas Demandas para ser notificado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <DeliveryStatusWidget />
        </div>
      </div>

      <OpportunityRadar
        refreshKey={refreshKey}
        onAddNeed={triggerRefresh}
        reputationScore={profileScore}
      />

      <div className="grid gap-6 md:grid-cols-3 pt-6 border-t border-border/50">
        <div className="md:col-span-2 space-y-6">
          <ReferralTracker userId={authUser?.id || ''} referralLink={referralLink} />

          <div className="grid gap-4 sm:grid-cols-2 mt-6">
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

          <div className="mt-6">
            <MatchesChartWidget />
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <AmbassadorWidget tier={userTier} referrals={referralsCount} />
          <ReputationRanking />
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Funil de Negócios de Conexões</CardTitle>
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
                  <div className="h-4" />
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
