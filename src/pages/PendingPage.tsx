import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/main'

export default function PendingPage() {
  const navigate = useNavigate()
  const { logout } = useAppStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-elevation">
        <ShieldAlert className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Solicitação em Análise</h1>
        <p className="text-muted-foreground mb-6">
          Sua aplicação foi recebida, mas requer validação manual pelo comitê do Prime Circle. Você
          será notificado por e-mail assim que o acesso for liberado.
        </p>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-border text-muted-foreground"
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  )
}
