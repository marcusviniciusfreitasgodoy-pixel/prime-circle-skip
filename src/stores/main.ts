import { createContext, createElement, useContext, useState, ReactNode } from 'react'

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
  chapter: string
  onboarded?: boolean
  lastLogin?: string
  lastContributionAt?: string
  referrals: number
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

interface AppState {
  user: User | null
  listings: Listing[]
  needs: Need[]
  matches: Match[]
  brokerMonitoring: BrokerMonitor[]
  candidates: Candidate[]
  pageViews: { path: string; timestamp: string }[]
  logs: { action: string; details: string; timestamp: string }[]
  statusLogs: {
    entity: string
    entityId: string
    oldStatus: string
    newStatus: string
    timestamp: string
  }[]
  planLimitModalOpen: boolean
  setPlanLimitModalOpen: (open: boolean) => void
  login: (email: string, method: 'magic_link' | 'password', status?: UserStatus) => void
  logout: () => void
  completeOnboarding: () => void
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
}

const initialListings: Listing[] = [
  {
    id: '1',
    title: 'Cobertura Lúcio Costa',
    type: 'Cobertura',
    price: 'R$ 8.500.000',
    priceValue: 8500000,
    area: '450m²',
    beds: 4,
    neighborhood: 'Lúcio Costa',
    chapter: 'Barra da Tijuca',
    status: 'Disponível',
    image: 'https://img.usecurling.com/p/600/400?q=luxury%20penthouse',
    ownerId: 'user1',
  },
]

const initialNeeds: Need[] = [
  {
    id: '1',
    title: 'Cliente Família 4 Pessoas',
    type: 'Casa',
    priceRange: 'Até R$ 7M',
    neighborhood: 'Santa Mônica',
    chapter: 'Barra da Tijuca',
    urgency: 'Alta',
    ownerId: 'other',
  },
]

const initialMatches: Match[] = [{ id: '1', needId: '1', listingId: '1', status: 'Proposta' }]

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [needs, setNeeds] = useState<Need[]>(initialNeeds)
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [brokerMonitoring] = useState<BrokerMonitor[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 'c1',
      name: 'Carlos Mendes',
      email: 'carlos@mendes.com',
      phone: '21999991111',
      creci: '12345',
      region: 'Barra',
      ticket: '3M',
      status: 'pending',
    },
  ])
  const [pageViews, setPageViews] = useState<{ path: string; timestamp: string }[]>([])
  const [logs, setLogs] = useState<{ action: string; details: string; timestamp: string }[]>([])
  const [statusLogs, setStatusLogs] = useState<
    { entity: string; entityId: string; oldStatus: string; newStatus: string; timestamp: string }[]
  >([])
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false)

  const login = (email: string, method: 'magic_link' | 'password', forcedStatus?: UserStatus) => {
    // Mock session creation with appropriate permissions
    const status = forcedStatus || (email.includes('admin') ? 'admin' : 'approved')
    const isAdmin = status === 'admin'

    setUser({
      id: isAdmin ? 'admin-1' : 'user1',
      name: isAdmin ? 'Admin Root' : 'João Corretor',
      email,
      status,
      tier: 'Ambassador',
      plan: isAdmin ? 'Founder' : 'Free',
      chapter: 'Barra da Tijuca',
      avatar: `https://img.usecurling.com/ppl/thumbnail?gender=${isAdmin ? 'female' : 'male'}&seed=1`,
      onboarded: isAdmin,
      lastLogin: new Date().toISOString(),
      lastContributionAt: new Date().toISOString(),
      referrals: 2,
    })
    logEvent('Login', `User logged in via ${method}`)
  }

  const logout = () => setUser(null)

  const completeOnboarding = () => {
    setUser((prev) => (prev ? { ...prev, onboarded: true } : prev))
    logEvent('Onboarding', 'Usuário completou onboarding')
  }

  const logEvent = (action: string, details: string) => {
    setLogs((prev) => [...prev, { action, details, timestamp: new Date().toISOString() }])
  }

  const trackPageView = (path: string) => {
    setPageViews((prev) => [...prev, { path, timestamp: new Date().toISOString() }])
  }

  const checkPlanLimits = (type: 'listings' | 'needs' | 'matches' | 'closing') => {
    if (!user) return false
    if (user.plan === 'Founder' || user.plan === 'Standard') return true

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
      return false // Free plan cannot register closings directly
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
        pageViews,
        logs,
        statusLogs,
        planLimitModalOpen,
        setPlanLimitModalOpen,
        login,
        logout,
        completeOnboarding,
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
