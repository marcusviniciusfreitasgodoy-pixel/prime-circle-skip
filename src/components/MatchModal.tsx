import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import useAppStore, { Need, Listing } from '@/stores/main'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatchModalProps {
  need: Need | null
  isOpen: boolean
  onClose: () => void
}

export function MatchModal({ need, isOpen, onClose }: MatchModalProps) {
  const { listings, user, addMatch } = useAppStore()
  const [selectedListing, setSelectedListing] = useState<string | null>(null)
  const myListings = listings.filter((l) => l.ownerId === user?.id)

  const handleConfirm = () => {
    if (need && selectedListing) {
      addMatch(need.id, selectedListing)
      toast.success('Imóvel vinculado com sucesso! O corretor parceiro será notificado.')
      onClose()
      setSelectedListing(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border text-white">
        <DialogHeader>
          <DialogTitle>Vincular Imóvel</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecione um dos seus imóveis para apresentar a esta demanda.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] mt-4 pr-4">
          <div className="space-y-3">
            {myListings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Você não possui imóveis cadastrados.
              </p>
            ) : (
              myListings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => setSelectedListing(listing.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedListing === listing.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <img src={listing.image} alt="" className="w-16 h-16 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-primary">{listing.price}</p>
                  </div>
                  {selectedListing === listing.id && (
                    <CheckCircle2 className="text-primary w-5 h-5" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-white hover:bg-secondary"
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedListing} className="gold-gradient">
            Confirmar Vínculo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
