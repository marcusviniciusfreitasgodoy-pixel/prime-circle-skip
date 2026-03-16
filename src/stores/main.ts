import { createContext, createElement, useContext, useState, ReactNode } from 'react'

export type UserStatus = 'pending' | 'approved' | 'admin' | null
export type Tier = 'None' | 'Ambassador' | 'Silver' | 'Gold' | 'Elite'
export type User = {
  id: string
  name: string
  status: UserStatus
  avatar?: string
  tier: Tier
  onboarded?: boolean
  lastLogin?: string
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
  urgency: 'Alta' | 'Média' | 'Baixa'
  ownerId: string
}
export type Match = {
  id: string
  needId: string
  listingId: string
  status: 'Novo' | 'Contato' | 'Visita' | 'Proposta' | 'Fechado'
  finalValue?: string
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
  pageViews: { path: string; timestamp: string }[]
  logs: { action: string; details: string; timestamp: string }[]
  planLimitModalOpen: boolean
  setPlanLimitModalOpen: (open: boolean) => void
  login: (status: UserStatus) => void
  logout: () => void
  completeOnboarding: () => void
  addListing: (listing: Partial<Listing>) => boolean
  addNeed: (need: Partial<Need>) => boolean
  addMatch: (needId: string, listingId: string) => boolean
  updateMatchStatus: (matchId: string, status: Match['status']) => void
  closeMatch: (matchId: string, finalValue: string) => void
  trackPageView: (path: string) => void
  logEvent: (action: string, details: string) => void
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
    urgency: 'Alta',
    ownerId: 'other',
  },
]

const initialMatches: Match[] = [{ id: '1', needId: '1', listingId: '1', status: 'Contato' }]

const initialBrokerMonitoring: BrokerMonitor[] = [
  {
    id: '1',
    name: 'João Corretor',
    commitmentLevel: 'Alto',
    toolAdoption: 'Alta',
    lastActive: 'Hoje',
    status: 'Ativo',
  },
  {
    id: '2',
    name: 'Maria Santos',
    commitmentLevel: 'Médio',
    toolAdoption: 'Média',
    lastActive: 'Há 3 dias',
    status: 'Ativo',
  },
  {
    id: '3',
    name: 'Pedro Almeida',
    commitmentLevel: 'Baixo',
    toolAdoption: 'Baixa',
    lastActive: 'Há 25 dias',
    status: 'Risco de Exclusão',
  },
]

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [needs, setNeeds] = useState<Need[]>(initialNeeds)
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [brokerMonitoring] = useState<BrokerMonitor[]>(initialBrokerMonitoring)
  const [pageViews, setPageViews] = useState<{ path: string; timestamp: string }[]>([])
  const [logs, setLogs] = useState<{ action: string; details: string; timestamp: string }[]>([])
  const [planLimitModalOpen, setPlanLimitModalOpen] = useState(false)

  const login = (status: UserStatus) =>
    setUser({
      id: 'user1',
      name: 'João Corretor',
      status,
      tier: 'None',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
      onboarded: status === 'admin' ? true : false,
      lastLogin: new Date().toISOString(),
    })

  const logout = () => setUser(null)

  const completeOnboarding = () => {
    setUser((prev) => (prev ? { ...prev, onboarded: true } : prev))
  }

  const logEvent = (action: string, details: string) => {
    setLogs((prev) => [...prev, { action, details, timestamp: new Date().toISOString() }])
  }

  const trackPageView = (path: string) => {
    setPageViews((prev) => [...prev, { path, timestamp: new Date().toISOString() }])
  }

  const checkPlanLimits = (type: 'listings' | 'needs' | 'matches') => {
    if (!user || user.tier !== 'None') return true

    if (type === 'listings') {
      const myListings = listings.filter((l) => l.ownerId === user.id).length
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

    return true
  }

  const addListing = (listing: Partial<Listing>) => {
    if (!checkPlanLimits('listings')) {
      setPlanLimitModalOpen(true)
      return false
    }
    setListings((prev) => [
      ...prev,
      {
        ...listing,
        id: Date.now().toString(),
        ownerId: user?.id || 'unknown',
        status: 'Disponível',
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
    setNeeds((prev) => [
      ...prev,
      { ...need, id: Date.now().toString(), ownerId: user?.id || 'unknown' } as Need,
    ])
    logEvent('Demanda Cadastrada', `Demanda adicionada: ${need.title}`)
    return true
  }

  const addMatch = (needId: string, listingId: string) => {
    if (!checkPlanLimits('matches')) {
      setPlanLimitModalOpen(true)
      return false
    }
    setMatches((prev) => [
      ...prev,
      { id: Date.now().toString(), needId, listingId, status: 'Novo' },
    ])
    logEvent('Match Criado', `Need: ${needId}, Listing: ${listingId}`)
    return true
  }

  const updateMatchStatus = (id: string, status: Match['status']) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    logEvent('Status do Match Atualizado', `Match: ${id}, Novo Status: ${status}`)
  }

  const closeMatch = (matchId: string, finalValue: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'Fechado', finalValue } : m)),
    )
    logEvent('Negócio Fechado', `Match: ${matchId}, Valor Final: ${finalValue}`)
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
        pageViews,
        logs,
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
        trackPageView,
        logEvent,
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
