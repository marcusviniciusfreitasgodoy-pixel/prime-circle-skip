import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/main'

export function PlanLimitModal() {
  const { planLimitModalOpen, setPlanLimitModalOpen } = useAppStore()
  const navigate = useNavigate()

  const handleUpgrade = () => {
    setPlanLimitModalOpen(false)
    navigate('/plans')
  }

  return (
    <Dialog open={planLimitModalOpen} onOpenChange={setPlanLimitModalOpen}>
      <DialogContent className="bg-card border-primary/50 sm:max-w-[425px] shadow-elevation overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Crown className="w-32 h-32 text-primary rotate-12" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Limite de Plano Alcançado
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base pt-2">
            Você atingiu o limite de atividades do plano Free. Para escalar suas conexões e fechar
            mais negócios, eleve seu plano para <strong className="text-primary">
              Standard
            </strong>{' '}
            ou torne-se <strong className="text-white">Ambassador</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-secondary/50 p-4 rounded-lg border border-border my-4 space-y-3 text-sm text-white">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Imóveis Ativos:</span>
            <span className="text-primary font-medium">Ilimitado no Standard</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Demandas:</span>
            <span className="text-primary font-medium">Ilimitado no Standard</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Matches/mês:</span>
            <span className="text-primary font-medium">Ilimitado no Standard</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button className="gold-gradient w-full h-12 text-lg font-bold" onClick={handleUpgrade}>
            Ver Planos e Fazer Upgrade
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPlanLimitModalOpen(false)}
            className="text-muted-foreground hover:text-white"
          >
            Talvez mais tarde
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
