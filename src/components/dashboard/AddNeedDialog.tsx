import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle } from 'lucide-react'

export function AddNeedDialog({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const profile = formData.get('profile') as string
    const description = formData.get('description') as string
    const budget = formData.get('budget') as string
    const region = formData.get('region') as string

    const { error } = await supabase.from('documents').insert({
      content: description,
      metadata: {
        type: 'demanda',
        user_id: user.id,
        profile,
        budget,
        region,
      },
    })

    setLoading(false)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao publicar necessidade. Tente novamente.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Demanda publicada no Radar! Você será notificado se houver match.',
        className: 'bg-card border-primary/50 text-white',
      })
      setOpen(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_15px_rgba(201,168,76,0.1)] font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Postar Demanda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Publicar Nova Necessidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="profile">Perfil da Necessidade</Label>
            <Input
              id="profile"
              name="profile"
              required
              placeholder="Ex: Cliente busca apto 3 suítes"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento (Budget)</Label>
              <Input id="budget" name="budget" required placeholder="Ex: Até R$ 3M" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Região de Interesse</Label>
              <Input id="region" name="region" required placeholder="Ex: Itaim Bibi ou Moema" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada</Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Detalhes adicionais, restrições ou preferências do cliente..."
              className="resize-none h-24"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar Demanda'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
