import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAppStore, { Need } from '@/stores/main'
import { toast } from 'sonner'

export function MatchModal({
  need,
  isOpen,
  onClose,
}: {
  need: Need | null
  isOpen: boolean
  onClose: () => void
}) {
  const { listings, user, addMatch } = useAppStore()
  const [selectedListing, setSelectedListing] = useState('')

  const myListings = listings.filter((l) => l.ownerId === user?.id)

  const handleConfirm = () => {
    if (!selectedListing || !need) return
    const success = addMatch(need.id, selectedListing)
    if (success) {
      toast.success('Parceria proposta! O negócio foi adicionado ao seu pipeline.')
      onClose()
      setSelectedListing('')
    } else {
      // The modal closes to let the PlanLimitModal take over smoothly
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Vincular Imóvel à Demanda</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Escolha um dos seus imóveis disponíveis para propor parceria (50/50) nesta demanda:{' '}
            <span className="text-white font-medium">{need?.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {myListings.length === 0 ? (
            <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              Você não tem imóveis cadastrados para vincular.
            </p>
          ) : (
            <Select value={selectedListing} onValueChange={setSelectedListing}>
              <SelectTrigger className="w-full bg-background border-border text-white">
                <SelectValue placeholder="Selecione um imóvel" />
              </SelectTrigger>
              <SelectContent>
                {myListings.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.title} - {l.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedListing}
            className="gold-gradient text-black"
          >
            Confirmar Match
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
