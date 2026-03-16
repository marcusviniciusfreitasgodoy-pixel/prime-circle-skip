import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAppStore from '@/stores/main'

export function ProtectedRoute() {
  const { user } = useAppStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (user.status === 'pending' && location.pathname !== '/pending') {
    return <Navigate to="/pending" replace />
  }

  if (user.status === 'approved' || user.status === 'admin') {
    if (location.pathname === '/pending') {
      return <Navigate to={user.onboarded ? '/dashboard' : '/onboarding'} replace />
    }

    if (!user.onboarded && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />
    }

    if (user.onboarded && location.pathname === '/onboarding') {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
