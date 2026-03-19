import { useState, useEffect } from 'react'

let isScriptLoaded = false
let scriptLoadPromise: Promise<void> | null = null

export function useGoogleMapsScript() {
  const [isLoaded, setIsLoaded] = useState(isScriptLoaded)

  useEffect(() => {
    if (isScriptLoaded) {
      setIsLoaded(true)
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      console.warn('VITE_GOOGLE_PLACES_API_KEY is not defined. Autocomplete will not work.')
      return
    }

    if (!scriptLoadPromise) {
      scriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
          isScriptLoaded = true
          resolve()
        }
        script.onerror = (err) => reject(err)
        document.head.appendChild(script)
      })
    }

    scriptLoadPromise.then(() => setIsLoaded(true)).catch(console.error)
  }, [])

  return isLoaded
}
