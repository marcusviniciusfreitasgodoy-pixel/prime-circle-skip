import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'
import { PartyPopper, ArrowLeft } from 'lucide-react'

export default function MatchClosePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { matches, needs, listings, closeMatch } = useAppStore()
  const [value, setValue] = useState('')

  const match = matches.find((m) => m.id === id)
  const need = match ? needs.find((n) => n.id === match.needId) : null
  const listing = match ? listings.find((l) => l.id === match.listingId) : null

  if (!match || !need || !listing) {
    return <div className="text-white">Conexão não encontrada.</div>
  }

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value) {
      toast.error('Informe o valor final da transação.')
      return
    }
    closeMatch(match.id, value)
    toast.success('Parabéns! Negócio fechado com sucesso na plataforma.')
    navigate('/matches')
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in-up pt-8">
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-white"
        onClick={() => navigate('/matches')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Pipeline
      </Button>

      <Card className="bg-card border-primary/50 relative overflow-hidden shadow-elevation">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <PartyPopper className="w-32 h-32 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl text-white">Fechar Negócio</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Parabéns por chegar até aqui! Registre o valor final para validar a comissão 50/50.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary p-4 rounded-lg mb-6 border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Demanda</span>
              <span className="font-medium text-white">{need.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Imóvel</span>
              <span className="font-medium text-white">{listing.title}</span>
            </div>
          </div>

          <form onSubmit={handleClose} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="value" className="text-white text-base">
                Valor Final da Transação (R$)
              </Label>
              <Input
                id="value"
                placeholder="Ex: 8.000.000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-background border-border text-white text-lg h-12"
              />
            </div>
            <Button type="submit" className="w-full gold-gradient h-14 text-lg">
              Confirmar Fechamento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
