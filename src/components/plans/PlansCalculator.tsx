import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'

interface PlansCalculatorProps {
  matchesCount: number
  setMatchesCount: (val: number) => void
  discount: number
}

export function PlansCalculator({ matchesCount, setMatchesCount, discount }: PlansCalculatorProps) {
  return (
    <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl bg-secondary/40 border border-primary/20 shadow-[0_0_30px_rgba(201,168,76,0.05)] relative overflow-hidden">
      <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none blur-2xl">
        <div className="w-40 h-40 bg-primary rounded-full"></div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 text-center relative z-10">
        Calculadora de Liquidez
      </h3>
      <p className="text-muted-foreground text-center mb-10 relative z-10 text-lg">
        No Prime Circle, quem colabora mais paga menos. Simule seu desconto baseado no volume de
        matches mensais.
      </p>
      <div className="space-y-8 relative z-10 px-4">
        <div className="flex items-center justify-between">
          <span className="text-lg text-white font-medium">
            Conexões no mês: <strong className="text-primary text-2xl">{matchesCount}</strong>
          </span>
          <Badge className="bg-primary text-black font-bold text-lg px-4 py-1.5 rounded-md shadow-sm">
            {discount * 100}% OFF
          </Badge>
        </div>
        <div className="pt-2">
          <Slider
            value={[matchesCount]}
            onValueChange={(val) => setMatchesCount(val[0])}
            max={30}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mt-4 font-medium">
          <span>0</span>
          <span className={matchesCount >= 10 ? 'text-primary transition-colors' : ''}>
            10 matches (20%)
          </span>
          <span className={matchesCount >= 20 ? 'text-primary transition-colors' : ''}>
            20+ matches (30%)
          </span>
        </div>
      </div>
    </div>
  )
}
