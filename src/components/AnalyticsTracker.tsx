import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import useAppStore from '@/stores/main'

export function AnalyticsTracker() {
  const location = useLocation()
  const { trackPageView } = useAppStore()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname, trackPageView])

  return null
}
