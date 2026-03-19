import { useState, useEffect } from 'react'

declare global {
  interface Window {
    gm_authFailure?: () => void
  }
}

let isScriptLoaded = false
let isScriptFailed = false
let scriptLoadPromise: Promise<void> | null = null

export function useGoogleMapsScript() {
  const [state, setState] = useState({ isLoaded: isScriptLoaded, loadError: isScriptFailed })

  useEffect(() => {
    if (isScriptLoaded) {
      setState({ isLoaded: true, loadError: false })
      return
    }

    if (isScriptFailed) {
      setState({ isLoaded: false, loadError: true })
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
    if (!apiKey || apiKey === 'your_google_places_api_key_here' || apiKey === 'undefined') {
      console.warn(
        'Google Maps API key is invalid or missing. Google Maps features will be disabled gracefully.',
      )
      isScriptFailed = true
      setState({ isLoaded: false, loadError: true })
      return
    }

    if (!scriptLoadPromise) {
      scriptLoadPromise = new Promise((resolve) => {
        window.gm_authFailure = () => {
          console.warn('Google Maps authentication failed. Please check your API key.')
          isScriptFailed = true
          setState({ isLoaded: false, loadError: true })
          resolve()
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
          if (!isScriptFailed) {
            isScriptLoaded = true
            setState({ isLoaded: true, loadError: false })
          }
          resolve()
        }
        script.onerror = (err) => {
          isScriptFailed = true
          console.warn('Failed to load Google Maps script gracefully', err)
          setState({ isLoaded: false, loadError: true })
          resolve()
        }
        document.head.appendChild(script)
      })
    } else {
      scriptLoadPromise.then(() => {
        setState({ isLoaded: isScriptLoaded, loadError: isScriptFailed })
      })
    }
  }, [])

  return state
}
