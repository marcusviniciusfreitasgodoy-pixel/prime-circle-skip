import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bed, Maximize, MapPin } from 'lucide-react'
import { Listing } from '@/stores/main'

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-md text-white border-border">
          {listing.status}
        </Badge>
        <Badge className="absolute top-3 right-3 gold-gradient">{listing.type}</Badge>
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-white truncate text-lg">{listing.title}</h3>
          <p className="text-primary font-bold text-xl">{listing.price}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{listing.neighborhood}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Maximize className="w-4 h-4" /> {listing.area}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Bed className="w-4 h-4" /> {listing.beds}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
