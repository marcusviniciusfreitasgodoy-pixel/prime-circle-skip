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

  if (user.status === 'approved' && location.pathname === '/pending') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
