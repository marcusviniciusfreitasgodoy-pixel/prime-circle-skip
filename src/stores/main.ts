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

interface AppState {
  user: User | null
  listings: Listing[]
  needs: Need[]
  matches: Match[]
  pageViews: { path: string; timestamp: string }[]
  logs: { action: string; details: string; timestamp: string }[]
  login: (status: UserStatus) => void
  logout: () => void
  completeOnboarding: () => void
  addMatch: (needId: string, listingId: string) => void
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

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [needs, setNeeds] = useState<Need[]>(initialNeeds)
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [pageViews, setPageViews] = useState<{ path: string; timestamp: string }[]>([])
  const [logs, setLogs] = useState<{ action: string; details: string; timestamp: string }[]>([])

  const login = (status: UserStatus) =>
    setUser({
      id: 'user1',
      name: 'João Corretor',
      status,
      tier: 'Gold',
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

  const addMatch = (needId: string, listingId: string) => {
    setMatches((prev) => [
      ...prev,
      { id: Date.now().toString(), needId, listingId, status: 'Novo' },
    ])
    logEvent('Match Criado', `Need: ${needId}, Listing: ${listingId}`)
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
        pageViews,
        logs,
        login,
        logout,
        completeOnboarding,
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
