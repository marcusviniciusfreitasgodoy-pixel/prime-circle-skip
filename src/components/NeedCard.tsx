import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Wallet } from 'lucide-react'
import type { Need } from '@/stores/main'

export function NeedCard({ need, action }: { need: Need; action?: React.ReactNode }) {
  const urgencyColor = {
    Alta: 'text-red-400 border-red-400/20 bg-red-400/10',
    Média: 'text-orange-400 border-orange-400/20 bg-orange-400/10',
    Baixa: 'text-green-400 border-green-400/20 bg-green-400/10',
  }

  return (
    <Card className="border-border bg-secondary">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div>
          <h3 className="font-semibold text-white mb-1">{need.title}</h3>
          <Badge variant="outline" className={urgencyColor[need.urgency]}>
            Urgência {need.urgency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>{need.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{need.neighborhood}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span>{need.priceRange}</span>
          </div>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}
