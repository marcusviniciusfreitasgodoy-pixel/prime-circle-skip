import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Star } from 'lucide-react'

export function ReviewDialog({
  partnerId,
  partnerName,
  children,
}: {
  partnerId: string
  partnerName: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!user) return
    if (rating === 0) {
      toast({
        title: 'Atenção',
        description: 'Por favor, selecione uma nota de 1 a 5 estrelas.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const { error } = await supabase.from('broker_reviews').insert({
      reviewer_id: user.id,
      reviewed_id: partnerId,
      rating,
      comment,
    })

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao enviar avaliação.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Avaliação enviada com sucesso!' })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Avaliar {partnerName}</DialogTitle>
          <DialogDescription>
            Deixe uma recomendação sobre como foi fazer negócio com este parceiro.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  rating >= star
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-muted-foreground hover:text-yellow-500/50'
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Escreva um comentário (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full gold-gradient text-black font-semibold"
          >
            {loading ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
