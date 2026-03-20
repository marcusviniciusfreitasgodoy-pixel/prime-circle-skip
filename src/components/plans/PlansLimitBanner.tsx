import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface PlansLimitBannerProps {
  showLimitBanner: boolean
  setIsBannerVisible: (val: boolean) => void
}

export function PlansLimitBanner({ showLimitBanner, setIsBannerVisible }: PlansLimitBannerProps) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!showLimitBanner) return null

  const handleUpgrade = () => {
    if (location.pathname === '/plans') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/plans')
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-black px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-4 shadow-[0_-10px_30px_rgba(201,168,76,0.3)] animate-slide-up border-t border-primary/50">
      <p className="text-sm md:text-base font-semibold max-w-4xl text-center sm:text-left">
        Você atingiu seu limite de 3 demandas. Upgrade para PROFESSIONAL e publique ilimitadamente
        por R$ 97/mês (ou menos com desconto por matches).
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="default"
          size="sm"
          className="bg-black text-white hover:bg-black/80 font-bold shadow-sm"
          onClick={handleUpgrade}
        >
          Upgrade Agora
        </Button>
        <button
          onClick={() => setIsBannerVisible(false)}
          className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
