import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export function PwaUpdater() {
  const { toast } = useToast()
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwRegistration(registration)
              }
            })
          }
        })
      })
    }
  }, [])

  useEffect(() => {
    if (swRegistration) {
      toast({
        title: 'Atualização do Sistema',
        description: 'Uma nova versão do Prime Circle está disponível.',
        action: (
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              swRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            }}
          >
            Atualizar Agora
          </Button>
        ),
        duration: Infinity,
      })
    }
  }, [swRegistration, toast])

  return null
}
