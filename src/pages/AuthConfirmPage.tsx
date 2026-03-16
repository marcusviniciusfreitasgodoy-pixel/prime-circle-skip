import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAppStore from '@/stores/main'

export default function AuthConfirmPage() {
  const navigate = useNavigate()
  const { login } = useAppStore()

  useEffect(() => {
    // Simulating magic link verification process
    const timer = setTimeout(() => {
      login('approved') // Assigns approved status and triggers onboarding
      navigate('/onboarding')
    }, 2000)

    return () => clearTimeout(timer)
  }, [login, navigate])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Autenticando Acesso Seguro</h2>
          <p className="text-muted-foreground">
            Verificando seu token e preparando seu ambiente no Prime Circle...
          </p>
        </div>
      </div>
    </div>
  )
}
