import { createContext, createElement, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type UserStatus = 'pending' | 'approved' | 'admin' | null
export type Tier = 'None' | 'Ambassador' | 'Silver' | 'Gold' | 'Elite' | 'Elite+'
export type Plan = 'Free' | 'Founder' | 'Standard'

export type User = {
  id: string
  name: string
  email: string
  status: UserStatus
  avatar?: string
  tier: Tier
  plan: Plan
  wasFounder?: boolean
  chapter: string
  onboarded?: boolean
  lastLogin?: string
  lastContributionAt?: string
  referrals: number
  planStartedAt: string
  referralMonthsCredited: number
  suggestionMonthsCredited: number
  suggestionsSubmitted: number
  suggestionsImplemented: number
  lastViewedSuggestionsAt?: string
}

export type CommunityMember = {
  id: string
  name: string
  avatar: string
  suggestionsSubmitted: number
  suggestionsImplemented: number
  suggestionMonthsCredited: number
}

export type Candidate = {
  id: string
  name: string
  email: string
  phone: string
  creci: string
  region: string
  ticket: string
  referredBy?: string
  status: 'approved' | 'waitlist' | 'pending'
}

export type Listing = {
  id: string
  title: string
  type: string
  price: string
  priceValue: number
  area: string
  beds: number
  neighborhood: string
  chapter: string
  status: 'Disponível' | 'Reservado' | 'Vendido'
  image: string
  ownerId: string
}

export type Need = {
  id: string
  title: string
  type: string
  priceRange: string
  neighborhood: string
  chapter: string
  urgency: 'Alta' | 'Média' | 'Baixa'
  ownerId: string
}

export type Match = {
  id: string
  needId: string
  listingId: string
  status: 'Novo' | 'Contato' | 'Visita' | 'Proposta' | 'Fechado'
  finalValue?: string
  bilateralConfirmed?: boolean
}

export type BrokerMonitor = {
  id: string
  name: string
  commitmentLevel: 'Alto' | 'Médio' | 'Baixo'
  toolAdoption: 'Alta' | 'Média' | 'Baixa'
  lastActive: string
  status: 'Ativo' | 'Risco de Exclusão'
}

export type SuggestionStatus = 'Em Análise' | 'Em Desenvolvimento' | 'Entregue'

export type Suggestion = {
  id: string
  title: string
  desc: string
  category: string
  status: SuggestionStatus
  votes: number
  authorId: string
  updatedAt: string
}

export type ExpirationInfo = {
  expirationDate: Date
  daysLeft: number
  baseMonths: number
  totalCredits: number
  isExpired: boolean
}

export type PlanExpiryNotification = {
  id: string
  userId: string
  notificationType: '30_days' | '7_days' | 'expired'
  sentAt: string
}

interface AppState {
  user: User | null
  listings: Listing[]
  needs: Need[]
  matches: Match[]
  brokerMonitoring: BrokerMonitor[]
  candidates: Candidate[]
  suggestions: Suggestion[]
  communityMembers: CommunityMember[]
  pageViews: { path: string; timestamp: string }[]
  logs: { action: string; details: string; timestamp: string }[]
  statusLogs: {
    entity: string
    entityId: string
    oldStatus: string
    newStatus: string
    timestamp: string
  }[]
  planExpiryNotifications: PlanExpiryNotification[]
  notifications: { id: string; title: string; description: string }[]
  planLimitModalOpen: boolean
  setPlanLimitModalOpen: (open: boolean) => void
  login: (email: string, method: 'magic_link' | 'password', status?: UserStatus) => void
  logout: () => void
  completeOnboarding: () => void
  updateUser: (updates: Partial<User>) => void
  addListing: (listing: Partial<Listing>) => boolean
  addNeed: (need: Partial<Need>) => boolean
  addMatch: (needId: string, listingId: string) => boolean
  updateMatchStatus: (matchId: string, status: Match['status']) => void
  closeMatch: (matchId: string, finalValue: string, bilateralConfirmed: boolean) => boolean
  addCandidate: (candidate: Omit<Candidate, 'id'>) => void
  approveCandidate: (id: string) => void
  rejectCandidate: (id: string) => void
  trackPageView: (path: string) => void
  logEvent: (action: string, details: string) => void
  checkPlanLimits: (type: 'listings' | 'needs' | 'matches' | 'closing') => boolean
  getExpirationInfo: () => ExpirationInfo | null
  addSuggestion: (title: string, desc: string, category: string) => void
  voteSuggestion: (id: string) => void
  updateSuggestionStatus: (id: string, status: Suggestion['status']) => void
  markSuggestionsAsViewed: () => void
  clearNotifications: () => void
  enforceInactivity: () => void
}

const initialListings: Listing[] = []
const initialNeeds: Need[] = []
const initialMatches: Match[] = []
const initialSuggestions: Suggestion[] = []
const initialMembers: CommunityMember[] = []

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [needs, setNeeds] = useState<Need[]>(initialNeeds)
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>(initialMembers)
  const [notifications, setNotifications] = useState<
    { id: string; title: string; description: string }[]
  >([])
  const [brokerMonitoring] = useState<BrokerMonitor[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [pageViews, setPageViews] = useState<{ path: string; timestamp: string }[]>([])
  const [logs, setLogs] = useState<{ action: string; details: string; timestamp: string }[]>([])
  const [statusLogs, setStatusLogs] = useState<
    { entity: string; entityId: string; oldStatus: string; newStatus: string; timestamp: string }[]
  >([])
  const [planExpiryNotifications, setPlanExpiryNotifications] = useState<PlanExpiryNotification[]>(
    [],
  )
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false)

  const login = (email: string, method: 'magic_link' | 'password', forcedStatus?: UserStatus) => {
    const status = forcedStatus || (email.includes('admin') ? 'admin' : 'approved')
    const isAdmin = status === 'admin'

    const userStart = new Date()
    userStart.setMonth(userStart.getMonth() - 11)

    setUser({
      id: isAdmin ? 'admin-1' : 'user1',
      name: isAdmin ? 'Admin Root' : 'Usuário',
      email,
      status,
      tier: 'None',
      plan: isAdmin ? 'Founder' : 'Free',
      wasFounder: false,
      chapter: 'Barra da Tijuca',
      avatar: undefined,
      onboarded: isAdmin,
      lastLogin: new Date().toISOString(),
      lastContributionAt: new Date().toISOString(),
      referrals: 0,
      planStartedAt: userStart.toISOString(),
      referralMonthsCredited: 0,
      suggestionMonthsCredited: 0,
      suggestionsSubmitted: 0,
      suggestionsImplemented: 0,
      lastViewedSuggestionsAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    })
    logEvent('Login', `User logged in via ${method}`)
  }

  const logout = () => setUser(null)

  const completeOnboarding = () => {
    setUser((prev) => (prev ? { ...prev, onboarded: true } : prev))
    logEvent('Onboarding', 'Usuário completou onboarding')
  }

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  const logEvent = (action: string, details: string) => {
    setLogs((prev) => [...prev, { action, details, timestamp: new Date().toISOString() }])
  }

  const trackPageView = (path: string) => {
    setPageViews((prev) => [...prev, { path, timestamp: new Date().toISOString() }])
  }

  const clearNotifications = () => setNotifications([])

  const getExpirationInfo = (): ExpirationInfo | null => {
    if (!user || (!user.wasFounder && user.plan === 'Free')) return null
    const start = new Date(user.planStartedAt || new Date())
    const baseMonths = user.plan === 'Founder' || user.wasFounder ? 12 : 1
    const totalCredits = (user.referralMonthsCredited || 0) + (user.suggestionMonthsCredited || 0)

    start.setMonth(start.getMonth() + baseMonths + totalCredits)

    const now = new Date()
    const diffTime = start.getTime() - now.getTime()
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      expirationDate: start,
      daysLeft,
      baseMonths,
      totalCredits,
      isExpired: daysLeft <= 0,
    }
  }

  useEffect(() => {
    if (!user || (!user.wasFounder && user.plan !== 'Founder')) return

    const start = new Date(user.planStartedAt || new Date())
    const baseMonths = user.plan === 'Founder' || user.wasFounder ? 12 : 1
    const totalCredits = (user.referralMonthsCredited || 0) + (user.suggestionMonthsCredited || 0)
    start.setMonth(start.getMonth() + baseMonths + totalCredits)

    const now = new Date()
    const diffTime = start.getTime() - now.getTime()
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isExpired = daysLeft <= 0

    const checkAndSend = (type: '30_days' | '7_days' | 'expired') => {
      setPlanExpiryNotifications((prev) => {
        const alreadySent = prev.some((n) => n.userId === user.id && n.notificationType === type)
        if (alreadySent) return prev
        return [
          ...prev,
          {
            id: Date.now().toString(),
            userId: user.id,
            notificationType: type,
            sentAt: new Date().toISOString(),
          },
        ]
      })
    }

    if (isExpired) {
      checkAndSend('expired')
      if (user.plan === 'Founder') {
        setUser((prev) => (prev ? { ...prev, plan: 'Free' } : prev))
      }
    } else if (daysLeft <= 7) {
      checkAndSend('7_days')
    } else if (daysLeft <= 30) {
      checkAndSend('30_days')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user?.id,
    user?.plan,
    user?.planStartedAt,
    user?.wasFounder,
    user?.suggestionMonthsCredited,
    user?.referralMonthsCredited,
  ])

  const checkPlanLimits = (type: 'listings' | 'needs' | 'matches' | 'closing') => {
    if (!user) return false

    const expInfo = getExpirationInfo()
    const effectivePlan = expInfo?.isExpired ? 'Free' : user.plan

    if (effectivePlan === 'Founder' || effectivePlan === 'Standard') return true

    if (type === 'listings') {
      const myListings = listings.filter(
        (l) => l.ownerId === user.id && l.status === 'Disponível',
      ).length
      if (myListings >= 1) return false
    }
    if (type === 'needs') {
      const myNeeds = needs.filter((n) => n.ownerId === user.id).length
      if (myNeeds >= 1) return false
    }
    if (type === 'matches') {
      const myMatches = matches.length
      if (myMatches >= 3) return false
    }
    if (type === 'closing') {
      return false
    }

    return true
  }

  const addListing = (listing: Partial<Listing>) => {
    if (!checkPlanLimits('listings')) {
      setPlanLimitModalOpen(true)
      return false
    }
    const id = Date.now().toString()
    setListings((prev) => [
      ...prev,
      {
        ...listing,
        id,
        ownerId: user?.id || 'unknown',
        status: 'Disponível',
        chapter: user?.chapter || 'Barra da Tijuca',
      } as Listing,
    ])
    logEvent('Imóvel Cadastrado', `Imóvel adicionado: ${listing.title}`)
    return true
  }

  const addNeed = (need: Partial<Need>) => {
    if (!checkPlanLimits('needs')) {
      setPlanLimitModalOpen(true)
      return false
    }
    const id = Date.now().toString()
    setNeeds((prev) => [
      ...prev,
      {
        ...need,
        id,
        ownerId: user?.id || 'unknown',
        chapter: user?.chapter || 'Barra da Tijuca',
      } as Need,
    ])
    logEvent('Demanda Cadastrada', `Demanda adicionada: ${need.title}`)
    return true
  }

  const addMatch = (needId: string, listingId: string) => {
    if (!checkPlanLimits('matches')) {
      setPlanLimitModalOpen(true)
      return false
    }
    const id = Date.now().toString()
    setMatches((prev) => [...prev, { id, needId, listingId, status: 'Novo' }])
    setStatusLogs((prev) => [
      ...prev,
      {
        entity: 'match',
        entityId: id,
        oldStatus: '',
        newStatus: 'Novo',
        timestamp: new Date().toISOString(),
      },
    ])
    logEvent('Match Criado', `Need: ${needId}, Listing: ${listingId}`)
    return true
  }

  const updateMatchStatus = (id: string, status: Match['status']) => {
    const match = matches.find((m) => m.id === id)
    if (match) {
      setStatusLogs((prev) => [
        ...prev,
        {
          entity: 'match',
          entityId: id,
          oldStatus: match.status,
          newStatus: status,
          timestamp: new Date().toISOString(),
        },
      ])
    }
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    logEvent('Status do Match Atualizado', `Match: ${id}, Novo Status: ${status}`)
  }

  const closeMatch = (matchId: string, finalValue: string, bilateralConfirmed: boolean) => {
    if (!checkPlanLimits('closing')) {
      setPlanLimitModalOpen(true)
      return false
    }

    const matchToClose = matches.find((m) => m.id === matchId)

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, status: 'Fechado', finalValue, bilateralConfirmed } : m,
      ),
    )
    setStatusLogs((prev) => [
      ...prev,
      {
        entity: 'match',
        entityId: matchId,
        oldStatus: 'Proposta',
        newStatus: 'Fechado',
        timestamp: new Date().toISOString(),
      },
    ])
    logEvent('Negócio Fechado', `Match: ${matchId}, Valor Final: ${finalValue}`)

    // Record the accepted match and dynamically update matches performance
    if (bilateralConfirmed && matchToClose) {
      const matchedNeed = needs.find((n) => n.id === matchToClose.needId)
      const matchedListing = listings.find((l) => l.id === matchToClose.listingId)

      const broker1 = matchedNeed?.ownerId
      const broker2 = matchedListing?.ownerId
      const currentUserId = user?.id

      const recordForBroker = async (bId: string) => {
        if (!bId || bId === 'unknown') return
        try {
          const { data, error } = await supabase.functions.invoke('record-match', {
            body: { user_id: bId },
          })

          if (data?.success && bId === currentUserId) {
            toast.success(
              `Você fez ${data.match_count} matches este mês. Seu desconto é ${data.discount_percentage}%!`,
              {
                duration: 6000,
              },
            )
          }
        } catch (e) {
          console.error('Failed to record match:', e)
        }
      }

      if (broker1) recordForBroker(broker1)
      if (broker2 && broker2 !== broker1) recordForBroker(broker2)
    }

    return true
  }

  const addCandidate = (candidate: Omit<Candidate, 'id'>) => {
    setCandidates((prev) => [...prev, { ...candidate, id: Date.now().toString() }])
    logEvent('Nova Aplicação', `Candidato: ${candidate.name}, Status: ${candidate.status}`)
  }

  const approveCandidate = (id: string) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)))
    logEvent('Admin Action', `Candidato ${id} aprovado manualmente`)
  }

  const rejectCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id))
    logEvent('Admin Action', `Candidato ${id} rejeitado`)
  }

  const addSuggestion = (title: string, desc: string, category: string) => {
    const id = Date.now().toString()
    setSuggestions((prev) => [
      ...prev,
      {
        id,
        title,
        desc,
        category,
        status: 'Em Análise',
        votes: 1,
        authorId: user?.id || 'unknown',
        updatedAt: new Date().toISOString(),
      },
    ])
    if (user) {
      setUser((u) => (u ? { ...u, suggestionsSubmitted: (u.suggestionsSubmitted || 0) + 1 } : u))
      setCommunityMembers((members) =>
        members.map((m) =>
          m.id === user.id ? { ...m, suggestionsSubmitted: m.suggestionsSubmitted + 1 } : m,
        ),
      )
    }
    logEvent('Sugestão Adicionada', `Título: ${title}`)
  }

  const voteSuggestion = (id: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s)))
  }

  const updateSuggestionStatus = (id: string, status: Suggestion['status']) => {
    setSuggestions((prev) => {
      const suggestion = prev.find((s) => s.id === id)
      if (!suggestion) return prev

      if (suggestion.status !== status) {
        setNotifications((n) => [
          ...n,
          {
            id: Date.now().toString(),
            title: '📧 Atualização de Roadmap',
            description: `Sua sugestão "${suggestion.title}" avançou para o status "${status}".`,
          },
        ])
      }

      if (status === 'Entregue' && suggestion.status !== 'Entregue') {
        if (user && user.id === suggestion.authorId) {
          setUser((u) =>
            u
              ? {
                  ...u,
                  suggestionMonthsCredited: u.suggestionMonthsCredited + 1,
                  suggestionsImplemented: (u.suggestionsImplemented || 0) + 1,
                }
              : u,
          )
          setNotifications((n) => [
            ...n,
            {
              id: Date.now().toString() + '-bonus',
              title: '🚀 Bônus Especial!',
              description: `Sua sugestão foi Implementada. +1 mês de crédito adicionado à sua conta.`,
            },
          ])
        }
        setCommunityMembers((members) =>
          members.map((m) =>
            m.id === suggestion.authorId
              ? {
                  ...m,
                  suggestionsImplemented: m.suggestionsImplemented + 1,
                  suggestionMonthsCredited: m.suggestionMonthsCredited + 1,
                }
              : m,
          ),
        )
      }
      return prev.map((s) =>
        s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s,
      )
    })
    logEvent('Sugestão Atualizada', `ID: ${id}, Novo Status: ${status}`)
  }

  const markSuggestionsAsViewed = () => {
    setUser((prev) =>
      prev ? { ...prev, lastViewedSuggestionsAt: new Date().toISOString() } : prev,
    )
  }

  const enforceInactivity = () => {
    setUser((prev) => {
      if (!prev) return prev
      const newReferrals = Math.max(0, prev.referrals - 1)
      let newTier: Tier = 'None'
      if (newReferrals >= 99) newTier = 'Elite+'
      else if (newReferrals >= 15) newTier = 'Elite'
      else if (newReferrals >= 10) newTier = 'Gold'
      else if (newReferrals >= 7) newTier = 'Silver'
      else if (newReferrals >= 5) newTier = 'Ambassador'

      logEvent(
        'System Enforcement',
        `Inatividade detectada. Indicações ativas: ${newReferrals}. Novo Tier: ${newTier}.`,
      )
      return { ...prev, referrals: newReferrals, tier: newTier }
    })
  }

  return createElement(
    AppContext.Provider,
    {
      value: {
        user,
        listings,
        needs,
        matches,
        brokerMonitoring,
        candidates,
        suggestions,
        communityMembers,
        pageViews,
        logs,
        statusLogs,
        planExpiryNotifications,
        notifications,
        planLimitModalOpen,
        setPlanLimitModalOpen,
        login,
        logout,
        completeOnboarding,
        updateUser,
        addListing,
        addNeed,
        addMatch,
        updateMatchStatus,
        closeMatch,
        addCandidate,
        approveCandidate,
        rejectCandidate,
        trackPageView,
        logEvent,
        checkPlanLimits,
        getExpirationInfo,
        addSuggestion,
        voteSuggestion,
        updateSuggestionStatus,
        markSuggestionsAsViewed,
        clearNotifications,
        enforceInactivity,
      },
    },
    children,
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within AppProvider')
  return context
}
