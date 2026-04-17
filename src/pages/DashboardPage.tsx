import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AmbassadorWidget } from '@/components/AmbassadorWidget'
import { DashboardGuideCard } from '@/components/dashboard/DashboardGuideCard'
import { PortfolioTabs } from '@/components/dashboard/PortfolioTabs'
import { AddPropertyDialog } from '@/components/dashboard/AddPropertyDialog'
import { OpportunityRadar } from '@/components/dashboard/OpportunityRadar'
import { MarketIntelligenceWidget } from '@/components/dashboard/MarketIntelligenceWidget'
import { PendingValidations } from '@/components/dashboard/PendingValidations'
import { ReputationRanking } from '@/components/dashboard/ReputationRanking'
import { ReferralTracker } from '@/components/dashboard/ReferralTracker'
import { DeliveryStatusWidget } from '@/components/dashboard/DeliveryStatusWidget'
import { MatchesChartWidget } from '@/components/dashboard/MatchesChartWidget'
import { DashboardReferral } from '@/components/dashboard/DashboardReferral'
import { DashboardCollaboration } from '@/components/dashboard/DashboardCollaboration'
import { ReferralRanking } from '@/components/dashboard/ReferralRanking'
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
  Building,
  Target,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import useAppStore from '@/stores/main'
import type { Tier, Plan } from '@/stores/main'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useSEO } from '@/hooks/use-seo'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  useSEO({
    title: 'Painel de Controle | Prime Circle',
  })

  const { user, updateUser } = useAppStore()
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
  const [activeTab, setActiveTab] = useState('inicio')

  // New states for real data from Supabase
  const [dashboardStats, setDashboardStats] = useState({
    myProperties: 0,
    networkDemands: 0,
    activeConnections: 0,
    closedDeals: 0,
  })
  const [activePartnerships, setActivePartnerships] = useState<any[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const triggerRefresh = useCallback(() => setRefreshKey((prev) => prev + 1), [])

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

    const fetchDashboardStats = async () => {
      if (!authUser) return
      setIsLoadingStats(true)

      try {
        // 1. My Properties (All active offers for this user)
        const { count: myPropsCount } = await supabase
          .from('documents')
          .select('id', { count: 'exact' })
          .contains('metadata', { type: 'oferta', user_id: authUser.id })
          .limit(1)

        // 2. Network Demands (Global demands, acting as fallback/full view)
        const { count: demandsCount } = await supabase
          .from('documents')
          .select('id', { count: 'exact' })
          .contains('metadata', { type: 'demanda' })
          .limit(1)

        // 3. Partnerships (Funnel connections and closed deals)
        const { data: partnerships } = await supabase
          .from('partnerships')
          .select(
            `
            *,
            property:documents!partnerships_property_id_fkey(metadata),
            demand:documents!partnerships_demand_id_fkey(metadata)
          `,
          )
          .or(`broker_property_id.eq.${authUser.id},broker_demand_id.eq.${authUser.id}`)
          .order('last_interaction_at', { ascending: false })

        let activeConn = 0
        let closedD = 0
        const activeList: any[] = []

        if (partnerships) {
          partnerships.forEach((p) => {
            if (p.status === 'closed') {
              closedD++
            } else if (p.status !== 'cancelled' && p.status !== 'rejeitado') {
              activeConn++
              activeList.push(p)
            }
          })
        }

        if (mounted) {
          setDashboardStats({
            myProperties: myPropsCount || 0,
            networkDemands: demandsCount || 0,
            activeConnections: activeConn,
            closedDeals: closedD,
          })
          setActivePartnerships(activeList)
        }
      } catch (err) {
        console.warn('Error fetching dashboard real stats', err)
      } finally {
        if (mounted) setIsLoadingStats(false)
      }
    }

    fetchProfileData()
    fetchDashboardStats()

    return () => {
      mounted = false
    }
  }, [authUser, refreshKey, updateUser])

  const refCode = profileReferralCode || authUser?.id || user?.id || 'founder-123'
  const referralLink = `https://www.primecircle.app.br/?ref=${refCode}`

  const formatPlanName = (plan: string) => {
    if (plan === 'Founder') return 'Fundador'
    if (plan === 'Free') return 'Gratuito'
    return plan
  }

  const stats = [
    {
      title: 'Demandas da Rede',
      value: isLoadingStats ? '-' : dashboardStats.networkDemands.toString(),
      icon: Search,
      trend: 'Visão Global',
    },
    {
      title: 'Meus Imóveis Ativos',
      value: isLoadingStats ? '-' : dashboardStats.myProperties.toString(),
      icon: Building,
      trend: 'Ativos na rede',
    },
    {
      title: 'Conexões Abertas',
      value: isLoadingStats ? '-' : dashboardStats.activeConnections.toString(),
      icon: GitMerge,
      trend: 'No seu Funil',
    },
    {
      title: 'Fechamentos Validados',
      value: isLoadingStats ? '-' : dashboardStats.closedDeals.toString(),
      icon: Activity,
      trend: 'Confirmados',
    },
  ]

  const MATCH_STAGES = ['Novo', 'Contato', 'Visita', 'Proposta', 'Fechado'] as const

  const getStageIndex = (status: string) => {
    if (status === 'match') return 0
    if (status === 'contact') return 1
    if (status === 'visit') return 2
    if (status === 'proposal' || status === 'aguardando_vgv') return 3
    if (status === 'closed') return 4
    return 0
  }

  const handleAdvanceMatch = async (id: string, currentStatus: string) => {
    let nextStatus = ''
    if (currentStatus === 'match') nextStatus = 'contact'
    else if (currentStatus === 'contact') nextStatus = 'visit'
    else if (currentStatus === 'visit') nextStatus = 'proposal'
    else if (currentStatus === 'proposal' || currentStatus === 'aguardando_vgv') {
      navigate(`/matches/${id}/close`)
      return
    }

    if (nextStatus) {
      const { error } = await supabase
        .from('partnerships')
        .update({
          status: nextStatus,
          last_interaction_at: new Date().toISOString(),
          last_updated_by: authUser?.id,
        })
        .eq('id', id)

      if (!error) {
        toast({
          title: 'Status Atualizado',
          description: `A negociação avançou de etapa com sucesso.`,
          className: 'bg-card border-primary/50 text-white',
        })
        triggerRefresh()
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o status.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <DashboardGuideCard />

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

      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-primary/50 shadow-md">
            {profileAvatar && <AvatarImage src={profileAvatar} />}
            <AvatarFallback className="bg-secondary text-muted-foreground text-xl">
              {profileName ? profileName.substring(0, 2).toUpperCase() : 'US'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center flex-wrap gap-2 min-h-9">
              Bem-vindo,{' '}
              {isLoadingName ? <Skeleton className="h-8 w-32 bg-muted/20" /> : profileName}
              {!isLoadingName && profileScore > 80 && (
                <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 flex items-center gap-1 shadow-sm mt-1 sm:mt-0">
                  <ShieldCheck className="w-3 h-3" /> Status de Elite
                </Badge>
              )}
            </h2>
            <div className="text-muted-foreground mt-2 flex items-center flex-wrap gap-2 sm:gap-3 text-sm">
              <span className="flex items-center gap-1">
                Pontuação:{' '}
                <strong
                  className={`text-white px-2 py-0.5 rounded-md border border-border ${profileScore > 80 ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-secondary/80'}`}
                >
                  {isLoadingName ? '-' : profileScore}
                </strong>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <AddPropertyDialog onSuccess={triggerRefresh} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-card border border-border shadow-sm rounded-lg gap-1.5">
          <TabsTrigger
            value="inicio"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2.5 rounded-md text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Início</span>
          </TabsTrigger>
          <TabsTrigger
            value="portfolio"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2.5 rounded-md text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all"
          >
            <Building className="w-4 h-4" />
            <span>Meu Portfólio</span>
          </TabsTrigger>
          <TabsTrigger
            value="mercado"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2.5 rounded-md text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all"
          >
            <Target className="w-4 h-4" />
            <span>Mercado</span>
          </TabsTrigger>
          <TabsTrigger
            value="crescimento"
            className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary py-2.5 rounded-md text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Rede & Crescimento</span>
            <span className="sm:hidden">Rede</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INÍCIO */}
        <TabsContent
          value="inicio"
          className="space-y-6 outline-none animate-in fade-in-50 duration-500"
        >
          <PendingValidations />

          <Alert className="bg-primary/5 border-primary/30 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <AlertTitle className="font-bold text-white m-0">
                  Aumente seus Matches: Convide um Parceiro!
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2 text-sm text-muted-foreground max-w-3xl">
                Nossa rede é movida pela colaboração. Quanto mais corretores de confiança na
                plataforma, <strong>mais imóveis e demandas compatíveis</strong> são gerados para
                você. Compartilhe seu link exclusivo e ganhe benefícios.
              </AlertDescription>
            </div>
            <Button
              onClick={() => setActiveTab('crescimento')}
              className="shrink-0 relative z-10 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Indicar Parceiro
            </Button>
          </Alert>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card
                key={i}
                className="bg-card border-border shadow-sm hover:border-primary/50 transition-colors group"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Skeleton className="h-8 w-16 bg-muted/20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Funil de Negócios de Conexões
                  </CardTitle>
                  <CardDescription>
                    Fluxo de validação obrigatório até o fechamento. Acompanhe suas parcerias
                    ativas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {isLoadingStats ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <Skeleton
                            key={i}
                            className="h-32 w-full bg-secondary/30 rounded-lg border border-border"
                          />
                        ))}
                      </div>
                    ) : activePartnerships.length > 0 ? (
                      activePartnerships.map((match) => {
                        const needTitle =
                          match.demand?.metadata?.title ||
                          match.demand?.metadata?.tipo_imovel ||
                          'Demanda'
                        const listingTitle =
                          match.property?.metadata?.title ||
                          match.property?.metadata?.tipo_imovel ||
                          'Imóvel'
                        const currentIdx = getStageIndex(match.status)

                        return (
                          <div
                            key={match.id}
                            className="p-4 bg-background rounded-lg border border-border"
                          >
                            <div className="flex justify-between items-start mb-6 flex-col sm:flex-row gap-3 sm:gap-0">
                              <div>
                                <p className="text-white font-medium text-sm sm:text-base">
                                  {needTitle}{' '}
                                  <span className="text-muted-foreground mx-1 sm:mx-2">↔</span>{' '}
                                  {listingTitle}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Ref: {match.id.substring(0, 8).toUpperCase()}
                                </p>
                              </div>
                              {match.status !== 'closed' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto"
                                  onClick={() => handleAdvanceMatch(match.id, match.status)}
                                >
                                  {match.status === 'proposal' || match.status === 'aguardando_vgv'
                                    ? 'Registrar Fechamento'
                                    : 'Avançar Status'}{' '}
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              ) : (
                                <Badge className="bg-green-500/20 text-green-500 border-none hover:bg-green-500/30 self-start sm:self-auto">
                                  Fechamento Validado
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center w-full justify-between mt-6 relative overflow-x-auto pb-8 sm:overflow-visible sm:pb-0 scrollbar-hide">
                              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 z-0 min-w-[300px]" />
                              <div
                                className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 min-w-[300px]"
                                style={{
                                  width: `${(currentIdx / (MATCH_STAGES.length - 1)) * 100}%`,
                                }}
                              />

                              {MATCH_STAGES.map((stage, i) => (
                                <div
                                  key={stage}
                                  className="relative z-10 flex flex-col items-center gap-2 min-w-[60px]"
                                >
                                  <div
                                    className={cn(
                                      'w-4 h-4 rounded-full border-2 transition-colors',
                                      i <= currentIdx
                                        ? 'bg-primary border-primary'
                                        : 'bg-background border-border',
                                      i === currentIdx &&
                                        'shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-125',
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      'text-[9px] sm:text-[10px] uppercase font-bold tracking-wider absolute top-6 whitespace-nowrap',
                                      i <= currentIdx ? 'text-white' : 'text-muted-foreground',
                                    )}
                                  >
                                    {stage}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="h-2 sm:h-6" />
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma conexão ativa no momento.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <MatchesChartWidget />
            </div>
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-primary" /> Meus Alertas
                  </CardTitle>
                  <CardDescription>Avisos enviados via WhatsApp</CardDescription>
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
                            className="p-3 bg-secondary/30 rounded-lg border border-border/50 border-l-2 border-l-primary flex flex-col gap-1 hover:bg-secondary/50 transition-colors"
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
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: MEU PORTFÓLIO */}
        <TabsContent
          value="portfolio"
          className="space-y-6 outline-none animate-in fade-in-50 duration-500 pt-2"
        >
          <PortfolioTabs refreshKey={refreshKey} />
        </TabsContent>

        {/* TAB 3: MERCADO */}
        <TabsContent
          value="mercado"
          className="space-y-6 outline-none animate-in fade-in-50 duration-500 pt-2"
        >
          <OpportunityRadar
            refreshKey={refreshKey}
            onAddNeed={triggerRefresh}
            reputationScore={profileScore}
          />
          <MarketIntelligenceWidget />
        </TabsContent>

        {/* TAB 4: REDE & CRESCIMENTO */}
        <TabsContent
          value="crescimento"
          className="space-y-6 outline-none animate-in fade-in-50 duration-500 pt-2 w-full"
        >
          <div className="grid gap-6 md:grid-cols-3 w-full">
            <div className="md:col-span-2 space-y-6 max-w-full overflow-hidden">
              <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                <div className="min-w-[100%] w-fit">
                  <ReferralTracker userId={authUser?.id || ''} referralLink={referralLink} />
                </div>
              </div>
              <DashboardReferral />
            </div>
            <div className="md:col-span-1 space-y-6">
              <AmbassadorWidget tier={userTier} referrals={referralsCount} />
              <ReputationRanking />
              <ReferralRanking />
              <DeliveryStatusWidget />
            </div>
          </div>
          <DashboardCollaboration />
        </TabsContent>
      </Tabs>
    </div>
  )
}
