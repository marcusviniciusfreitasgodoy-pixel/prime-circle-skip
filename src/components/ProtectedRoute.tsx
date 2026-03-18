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
    let retryCount = 0
    const maxRetries = 10

    const fetchProfile = async () => {
      if (!authUser) {
        if (mounted) setLoadingProfile(false)
        return
      }

      const tryFetch = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('accepted_terms')
            .eq('id', authUser.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            if (error.code === 'PGRST116') {
              if (retryCount < maxRetries) {
                retryCount++
                if (mounted) setTimeout(tryFetch, 1000)
              } else {
                // User profile not found, likely due to DB reset. Force sign out to invalidate session.
                await signOut()
                if (mounted) setLoadingProfile(false)
              }
            } else {
              if (mounted) setLoadingProfile(false)
            }
          } else if (mounted && data) {
            setAcceptedTerms(data.accepted_terms ?? false)
            setLoadingProfile(false)
          }
        } catch (error) {
          console.error('Unexpected error fetching profile:', error)
          if (mounted) setLoadingProfile(false)
        }
      }

      tryFetch()
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
        <p className="text-muted-foreground text-sm animate-pulse">
          Verificando credenciais e sincronizando perfil...
        </p>
      </div>
    )
  }

  if (!mockUser && !authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const isPending = mockUser?.status === 'pending'
  const isAdmin = mockUser?.status === 'admin'

  // Ensure state synchronization via local storage override to prevent flashes
  const localAccepted = authUser
    ? localStorage.getItem(`terms_accepted_${authUser.id}`) === 'true'
    : false
  const hasAccepted =
    authUser && acceptedTerms !== null
      ? acceptedTerms || localAccepted || mockUser?.onboarded
      : mockUser?.onboarded || localAccepted

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
