import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, AlertCircle } from 'lucide-react'
import { Need } from '@/stores/main'

export function NeedCard({ need, action }: { need: Need; action?: React.ReactNode }) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors group h-full flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
            {need.type}
          </Badge>
          <Badge
            variant="outline"
            className="border-border text-muted-foreground flex items-center gap-1 bg-background"
          >
            <AlertCircle className="w-3 h-3" /> Urgência {need.urgency}
          </Badge>
        </div>

        <div className="space-y-1 flex-1">
          <h3 className="font-semibold text-white text-lg leading-tight">{need.title}</h3>
          <p className="text-xl font-bold text-primary">{need.priceRange}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2.5 rounded-lg border border-border">
          <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
          <span className="truncate">{need.neighborhood}</span>
        </div>

        {action}
      </CardContent>
    </Card>
  )
}
