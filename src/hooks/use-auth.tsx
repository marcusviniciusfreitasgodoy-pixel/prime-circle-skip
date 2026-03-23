import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string, metaData?: any) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithOtp: (email: string, redirectTo: string) => Promise<{ error: any }>
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

    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          await supabase.auth.signOut().catch(() => {})
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }

        if (!session) {
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          await supabase.auth.signOut().catch(() => {})
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(user)
        }
      } catch (err) {
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metaData?: any) => {
    try {
      const cleanEmail = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: metaData,
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
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
        const signInRes = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
        if (signInRes.data?.session) {
          setSession(signInRes.data.session)
          setUser(signInRes.data.user)
          data.session = signInRes.data.session
        }
      }

      return { data, error }
    } catch (err: any) {
      return { data: null, error: err }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase()
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  const signInWithOtp = async (email: string, redirectTo: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase()
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/auth/confirm`,
        },
      })
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, signUp, signIn, signInWithOtp, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
