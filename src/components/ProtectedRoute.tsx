import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAppStore from '@/stores/main'

export function ProtectedRoute() {
  const { user } = useAppStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/auth/confirm" replace state={{ from: location }} />
  }

  // Admin routing logic
  if (user.status === 'admin') {
    if (!location.pathname.startsWith('/admin') && location.pathname !== '/dashboard') {
      return <Navigate to="/admin" replace />
    }
    return <Outlet />
  }

  // Pending user routing
  if (user.status === 'pending') {
    if (location.pathname !== '/pending') {
      return <Navigate to="/pending" replace />
    }
    return <Outlet />
  }

  // Approved user routing
  if (user.status === 'approved') {
    if (!user.onboarded && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />
    }
    if (user.onboarded && location.pathname === '/onboarding') {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
