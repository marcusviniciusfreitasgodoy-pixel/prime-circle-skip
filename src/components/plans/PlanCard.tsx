import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'

export interface PlanFeature {
  text: string
  included: boolean
}

export interface PlanData {
  name: string
  basePrice: number
  priceLabel: string
  desc: string
  features: PlanFeature[]
  active: boolean
  btnText: string
  canBuy: boolean
  highlight?: boolean
}

interface PlanCardProps {
  plan: PlanData
  discount: number
  onCheckout: (planName: string, amount: number) => void
}

export function PlanCard({ plan, discount, onCheckout }: PlanCardProps) {
  return (
    <Card
      className={`bg-card border-border flex flex-col relative transition-all duration-300 ${
        plan.highlight
          ? 'border-primary shadow-[0_0_40px_rgba(201,168,76,0.15)] scale-105 z-10'
          : 'hover:border-border/80 hover:shadow-elevation'
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-sm">
          Recomendado
        </div>
      )}
      <CardHeader className="text-center pb-6 pt-8 px-6">
        <CardTitle className="text-2xl text-white font-bold tracking-tight">{plan.name}</CardTitle>
        <CardDescription className="text-muted-foreground mt-2 min-h-[44px] text-base">
          {plan.desc}
        </CardDescription>
        <div className="mt-6 flex flex-col items-center justify-center min-h-[90px]">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-white">
              {plan.priceLabel.split('/')[0]}
            </span>
            {plan.basePrice > 0 && (
              <span className="text-lg text-muted-foreground font-medium">/mês</span>
            )}
          </div>
          {plan.basePrice > 0 && discount > 0 && plan.canBuy && (
            <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full mt-3 inline-block">
              Valor original: R$ {plan.basePrice}/mês
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-8">
        <ul className="space-y-4">
          {plan.features.map((feat, j) => (
            <li key={j} className="flex items-start gap-3 text-sm">
              {feat.included ? (
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
              )}
              <span
                className={
                  feat.included
                    ? 'text-zinc-300 font-medium'
                    : 'text-muted-foreground/50 line-through'
                }
              >
                {feat.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="px-8 pb-8 pt-4">
        <Button
          variant={plan.active ? 'outline' : 'default'}
          disabled={!plan.canBuy || plan.active}
          onClick={() =>
            plan.canBuy && !plan.active
              ? onCheckout(plan.name, plan.basePrice * (1 - discount))
              : undefined
          }
          className={`w-full h-12 text-base font-bold transition-all ${
            plan.highlight && !plan.active
              ? 'gold-gradient text-black hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:scale-[1.02]'
              : plan.active
                ? 'border-border text-muted-foreground bg-secondary/50'
                : 'bg-secondary text-white hover:bg-secondary/80'
          }`}
        >
          {plan.btnText}
        </Button>
      </CardFooter>
    </Card>
  )
}
