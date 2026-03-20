import { Zap, CalendarDays, Gift } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ActivePlanCardProps {
  userPlan: any
}

export function ActivePlanCard({ userPlan }: ActivePlanCardProps) {
  if (!userPlan || userPlan.plans?.name === 'FREE') return null

  const planName = userPlan.plans?.name || 'Professional'
  const isFounder = userPlan.is_founder

  let expDate = userPlan.expires_at ? new Date(userPlan.expires_at) : null
  const isExpired = expDate ? expDate.getTime() < Date.now() : false
  const daysLeft = expDate ? Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <Card className="bg-primary/10 border-primary/30 mb-12 shadow-[0_0_30px_rgba(201,168,76,0.1)] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Zap className="w-32 h-32 text-primary" />
      </div>
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2 uppercase">Status: {planName}</h3>
          {isFounder && (
            <p className="text-primary font-medium mb-4 text-base">
              Membro Founder Exclusivo. Pagamentos ativados após período de carência.
            </p>
          )}
          <div className="flex flex-wrap gap-4 mt-2">
            {expDate && (
              <div className="bg-background/80 rounded-lg px-5 py-3 border border-border flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">
                    {isFounder ? 'Período Grátis Expira Em' : 'Vencimento'}
                  </span>
                  <span
                    className={`text-sm font-bold ${isExpired ? 'text-destructive' : 'text-white'}`}
                  >
                    {expDate.toLocaleDateString()} {!isExpired && `(${daysLeft} dias)`}
                  </span>
                </div>
              </div>
            )}
            <div className="bg-background/80 rounded-lg px-5 py-3 border border-border flex items-center gap-3">
              <Gift className="w-6 h-6 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">
                  Mimos e Benefícios
                </span>
                <span className="text-sm font-bold text-white">Ativos na Conta</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
