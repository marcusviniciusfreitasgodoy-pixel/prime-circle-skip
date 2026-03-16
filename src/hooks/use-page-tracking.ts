import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import useAppStore from '@/stores/main'

export function usePageTracking() {
  const location = useLocation()
  const { trackPageView } = useAppStore()
  const trackRef = useRef(trackPageView)

  useEffect(() => {
    trackRef.current = trackPageView
  }, [trackPageView])

  useEffect(() => {
    trackRef.current(location.pathname)
  }, [location.pathname])
}
