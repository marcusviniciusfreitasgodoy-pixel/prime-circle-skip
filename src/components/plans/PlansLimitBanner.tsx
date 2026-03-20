import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface PlansLimitBannerProps {
  showLimitBanner: boolean
  setIsBannerVisible: (val: boolean) => void
}

export function PlansLimitBanner({ showLimitBanner, setIsBannerVisible }: PlansLimitBannerProps) {
  if (!showLimitBanner) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-primary/95 backdrop-blur-sm text-black px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-4 shadow-md border-b border-primary animate-fade-in-down">
      <p className="text-sm font-semibold max-w-3xl text-center sm:text-left">
        Você atingiu seu limite de 3 demandas mensais. Faça o upgrade para PROFESSIONAL e publique
        ilimitadamente por R$ 97/mês (ou menos com desconto por matches).
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="default"
          size="sm"
          className="bg-black text-white hover:bg-black/80 font-bold shadow-sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Upgrade Agora
        </Button>
        <button
          onClick={() => setIsBannerVisible(false)}
          className="p-1 hover:bg-black/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
