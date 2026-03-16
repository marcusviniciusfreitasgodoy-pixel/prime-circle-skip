import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import useAppStore from '@/stores/main'

export function usePageTracking() {
  const location = useLocation()
  const { trackPageView } = useAppStore()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname, trackPageView])
}
