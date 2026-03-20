import { Zap, CalendarDays, Gift } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { User, ExpirationInfo } from '@/stores/main'

interface ActivePlanCardProps {
  user: User
  expInfo: ExpirationInfo
}

export function ActivePlanCard({ user, expInfo }: ActivePlanCardProps) {
  if (user.plan === 'Free') return null

  return (
    <Card className="bg-primary/10 border-primary/30 mb-12 shadow-[0_0_30px_rgba(201,168,76,0.1)] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Zap className="w-32 h-32 text-primary" />
      </div>
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Status: {user.plan === 'Standard' ? 'Professional' : user.plan}
          </h3>
          {user.plan === 'Founder' && (
            <p className="text-primary font-medium mb-4 text-base">
              Condição de fundador com pagamentos ativados após 12 meses de carência.
            </p>
          )}
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="bg-background/80 rounded-lg px-5 py-3 border border-border flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-muted-foreground" />
              <div>
                <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">
                  Vencimento
                </span>
                <span
                  className={`text-sm font-bold ${expInfo.isExpired ? 'text-destructive' : 'text-white'}`}
                >
                  {expInfo.expirationDate.toLocaleDateString()}{' '}
                  {!expInfo.isExpired && `(${expInfo.daysLeft} dias)`}
                </span>
              </div>
            </div>
            <div className="bg-background/80 rounded-lg px-5 py-3 border border-border flex items-center gap-3">
              <Gift className="w-6 h-6 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold">
                  Créditos Extras
                </span>
                <span className="text-sm font-bold text-white">
                  {expInfo.totalCredits} meses adicionados
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
