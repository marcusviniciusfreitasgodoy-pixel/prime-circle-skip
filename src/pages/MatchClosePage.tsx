import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'
import { useSEO } from '@/hooks/use-seo'

export default function MatchClosePage() {
  useSEO({ title: 'Fechar Negócio | Prime Circle' })
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { matches, closeMatch } = useAppStore()

  const match = matches.find((m) => m.id === id)
  const [finalValue, setFinalValue] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  if (!match) {
    return <div className="p-8 text-center text-white">Match não encontrado.</div>
  }

  const handleClose = async () => {
    if (!finalValue) {
      toast.error('Informe o valor final do negócio.')
      return
    }
    if (!confirmed) {
      toast.error('É necessário confirmação bilateral.')
      return
    }

    const success = closeMatch(match.id, finalValue, true)
    if (success !== false) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-12 animate-fade-in-up">
      <Card className="bg-card border-border shadow-elevation">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Fechar Negócio</CardTitle>
          <CardDescription className="text-muted-foreground">
            Informe os dados finais para concluir esta parceria e contabilizar o seu match.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white">Valor Final de Venda (VGV)</Label>
            <Input
              placeholder="Ex: 1.500.000,00"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
              className="bg-background border-border text-white"
            />
          </div>

          <div className="flex items-center space-x-3 bg-secondary/50 p-4 rounded-lg border border-border">
            <Checkbox
              id="confirmed"
              checked={confirmed}
              onCheckedChange={(c) => setConfirmed(c as boolean)}
            />
            <Label
              htmlFor="confirmed"
              className="text-sm text-white font-medium cursor-pointer leading-tight"
            >
              Confirmo que ambas as partes concordaram com o fechamento. (Confirmação Bilateral)
            </Label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleClose} className="gold-gradient text-black">
              Concluir Negócio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
