import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle, Lock } from 'lucide-react'

export function AddPropertyDialog({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOffMarket, setIsOffMarket] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const location = formData.get('location') as string
    const propertyType = formData.get('propertyType') as string

    const { error } = await supabase.from('documents').insert({
      content: description,
      metadata: {
        type: 'oferta',
        user_id: user.id,
        title,
        price,
        location,
        property_type: propertyType,
        is_off_market: isOffMarket,
      },
    })

    setLoading(false)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao divulgar o imóvel. Tente novamente.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: isOffMarket
          ? 'Imóvel Off-Market publicado com exclusividade.'
          : 'Imóvel publicado! Agora a rede já pode encontrar compatibilidades.',
        className: 'bg-card border-primary/50 text-white',
      })
      setOpen(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gold-gradient text-black font-semibold shadow-[0_0_15px_rgba(201,168,76,0.2)]">
          <PlusCircle className="w-4 h-4 mr-2" /> Divulgar Imóvel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Divulgar Novo Imóvel</DialogTitle>
          <DialogDescription>
            Insira os dados do imóvel. Imóveis marcados como Off-Market só serão vistos por
            corretores Elite (Reputação 70+).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Imóvel</Label>
            <Input id="title" name="title" required placeholder="Ex: Cobertura Duplex em Moema" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Tipo de Imóvel</Label>
              <Input id="propertyType" name="propertyType" required placeholder="Ex: Apartamento" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Valor</Label>
              <Input id="price" name="price" required placeholder="Ex: R$ 2.500.000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input id="location" name="location" required placeholder="Ex: Zona Sul, São Paulo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Descreva os detalhes, diferenciais e metragem do imóvel..."
              className="resize-none h-24"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/30">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Exclusivo Off-Market
              </Label>
              <p className="text-xs text-muted-foreground">
                Restringir visibilidade apenas para corretores de alta reputação.
              </p>
            </div>
            <Switch checked={isOffMarket} onCheckedChange={setIsOffMarket} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Publicar Imóvel'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
