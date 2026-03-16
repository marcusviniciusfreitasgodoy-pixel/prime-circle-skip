import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'
import { PartyPopper, ArrowLeft, ShieldAlert } from 'lucide-react'
import { sendTransactionalEmail } from '@/lib/email'

export default function MatchClosePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { matches, needs, listings, closeMatch, user } = useAppStore()
  const [value, setValue] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const match = matches.find((m) => m.id === id)
  const need = match ? needs.find((n) => n.id === match.needId) : null
  const listing = match ? listings.find((l) => l.id === match.listingId) : null

  if (!match || !need || !listing) {
    return <div className="text-white text-center py-12">Conexão não encontrada.</div>
  }

  if (match.status !== 'Proposta' && match.status !== 'Fechado') {
    return (
      <div className="max-w-xl mx-auto pt-16 text-center space-y-4 animate-fade-in-up">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold text-white">Ação não permitida</h2>
        <p className="text-muted-foreground">
          Apenas conexões que alcançaram a fase de "Proposta" podem ser registradas como fechadas.
        </p>
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
          Voltar
        </Button>
      </div>
    )
  }

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value) return toast.error('Informe o valor final da transação.')
    if (!confirmed) return toast.error('Confirmação bilateral pendente.')
    if (user?.plan === 'Free')
      return toast.error('Seu plano Free não permite registrar fechamentos.')

    const success = closeMatch(match.id, value, confirmed)
    if (success) {
      await sendTransactionalEmail('closing_confirmed', { matchId: match.id, value })
      toast.success('Parabéns! Fechamento registrado com sucesso.')
      navigate('/dashboard')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in-up pt-8">
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-white"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <Card className="bg-card border-primary/50 relative overflow-hidden shadow-elevation">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <PartyPopper className="w-32 h-32 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl text-white">Registrar Fechamento</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Valide a comissão 50/50. Requer confirmação bilateral da outra parte.
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
                disabled={match.status === 'Fechado'}
              />
            </div>

            <div className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-background">
              <Checkbox
                id="confirm"
                checked={confirmed || match.status === 'Fechado'}
                onCheckedChange={(c) => setConfirmed(!!c)}
                disabled={match.status === 'Fechado'}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="confirm" className="text-white text-sm">
                  Confirmação Bilateral
                </Label>
                <p className="text-xs text-muted-foreground">
                  Declaro que os honorários foram integralmente divididos (50/50) com o corretor
                  parceiro.
                </p>
              </div>
            </div>

            {match.status !== 'Fechado' ? (
              <Button
                type="submit"
                disabled={!confirmed}
                className="w-full gold-gradient text-black h-14 text-lg font-semibold"
              >
                Confirmar Fechamento
              </Button>
            ) : (
              <Button
                type="button"
                disabled
                className="w-full bg-secondary text-muted-foreground h-14 text-lg font-semibold border border-border"
              >
                Negócio já fechado
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
