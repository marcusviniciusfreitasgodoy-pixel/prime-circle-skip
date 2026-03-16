import { createContext, createElement, useContext, useState, ReactNode } from 'react'

export type UserStatus = 'pending' | 'approved' | 'admin' | null
export type User = { id: string; name: string; status: UserStatus; avatar?: string }

export type Listing = {
  id: string
  title: string
  price: string
  area: string
  beds: number
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
}

interface AppState {
  user: User
  listings: Listing[]
  needs: Need[]
  matches: Match[]
  login: (status: UserStatus) => void
  logout: () => void
  addMatch: (needId: string, listingId: string) => void
  updateMatchStatus: (matchId: string, status: Match['status']) => void
}

const initialListings: Listing[] = [
  {
    id: '1',
    title: 'Cobertura Lúcio Costa',
    price: 'R$ 8.500.000',
    area: '450m²',
    beds: 4,
    status: 'Disponível',
    image: 'https://img.usecurling.com/p/600/400?q=luxury%20penthouse',
    ownerId: 'user1',
  },
  {
    id: '2',
    title: 'Mansão Jardim Oceânico',
    price: 'R$ 12.000.000',
    area: '800m²',
    beds: 5,
    status: 'Disponível',
    image: 'https://img.usecurling.com/p/600/400?q=modern%20mansion',
    ownerId: 'user1',
  },
  {
    id: '3',
    title: 'Casa Cond. Santa Mônica',
    price: 'R$ 6.200.000',
    area: '380m²',
    beds: 4,
    status: 'Reservado',
    image: 'https://img.usecurling.com/p/600/400?q=luxury%20villa',
    ownerId: 'other',
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
  {
    id: '2',
    title: 'Investidor Gringo',
    type: 'Cobertura',
    priceRange: 'Até R$ 15M',
    neighborhood: 'Jardim Oceânico',
    urgency: 'Média',
    ownerId: 'other',
  },
]

const initialMatches: Match[] = [{ id: '1', needId: '1', listingId: '3', status: 'Contato' }]

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [needs, setNeeds] = useState<Need[]>(initialNeeds)
  const [matches, setMatches] = useState<Match[]>(initialMatches)

  const login = (status: UserStatus) =>
    setUser({
      id: 'user1',
      name: 'João Corretor',
      status,
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    })
  const logout = () => setUser(null)
  const addMatch = (needId: string, listingId: string) =>
    setMatches((prev) => [
      ...prev,
      { id: Date.now().toString(), needId, listingId, status: 'Novo' },
    ])
  const updateMatchStatus = (id: string, status: Match['status']) =>
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))

  return createElement(
    AppContext.Provider,
    {
      value: { user, listings, needs, matches, login, logout, addMatch, updateMatchStatus },
    },
    children,
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within AppProvider')
  return context
}
