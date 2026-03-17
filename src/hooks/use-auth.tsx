import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string, metaData?: any) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Validate session robustly using getUser() to ensure token is valid and user wasn't deleted by DB reset
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        setSession(null)
        setUser(null)
        setLoading(false)
      } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
          setUser(user)
          setLoading(false)
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metaData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metaData,
        // Removed emailRedirectTo to avoid forcing immediate SMTP triggers natively where possible
      },
    })

    if (error) {
      const authError = error as any
      if (authError.status === 429 || authError.code === 'over_email_send_rate_limit') {
        console.warn(`[Auth] Rate limit exceeded: ${authError.message} (code: ${authError.code})`)
      }
    }

    // Attempt auto-login if user was created but session is missing
    if (data?.user && !data?.session) {
      const signInRes = await supabase.auth.signInWithPassword({ email, password })
      if (signInRes.data?.session) {
        setSession(signInRes.data.session)
        setUser(signInRes.data.user)
        data.session = signInRes.data.session
      }
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
