import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bed, Maximize, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Listing } from '@/stores/main'

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="overflow-hidden group border-border bg-secondary hover:border-primary/50 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant={listing.status === 'Disponível' ? 'default' : 'secondary'}
            className="bg-background/80 backdrop-blur text-white border-none"
          >
            {listing.status}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-background/80 backdrop-blur hover:bg-primary hover:text-black"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-xl font-bold text-primary mb-4">{listing.price}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>{listing.area}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{listing.beds} Suítes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
