import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAppStore from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute() {
  const { user: mockUser } = useAppStore()
  const { user: authUser, loading: authLoading, signOut } = useAuth()
  const location = useLocation()

  const [acceptedTerms, setAcceptedTerms] = useState<boolean | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      if (!authUser) {
        if (mounted) setLoadingProfile(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('accepted_terms')
          .eq('id', authUser.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          if (error.code === 'PGRST116') {
            // User profile not found, likely due to DB reset. Force sign out to invalidate session.
            await signOut()
          }
        } else if (mounted && data) {
          setAcceptedTerms(data.accepted_terms ?? false)
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error)
      } finally {
        if (mounted) setLoadingProfile(false)
      }
    }

    if (!authLoading) {
      fetchProfile()
    }

    return () => {
      mounted = false
    }
  }, [authUser, authLoading, signOut])

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Verificando credenciais...</p>
      </div>
    )
  }

  if (!mockUser && !authUser) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  const isPending = mockUser?.status === 'pending'
  const isAdmin = mockUser?.status === 'admin'

  // Prefer real DB state over mock state if authUser is present
  const hasAccepted = authUser && acceptedTerms !== null ? acceptedTerms : mockUser?.onboarded

  if (isAdmin) {
    if (!location.pathname.startsWith('/admin') && location.pathname !== '/dashboard') {
      return <Navigate to="/admin" replace />
    }
    return <Outlet />
  }

  if (isPending) {
    if (location.pathname !== '/pending') {
      return <Navigate to="/pending" replace />
    }
    return <Outlet />
  }

  if (!hasAccepted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (hasAccepted && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
