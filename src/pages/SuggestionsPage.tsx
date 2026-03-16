import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { sendTransactionalEmail } from '@/lib/email'

export default function SuggestionsPage() {
  const suggestions = [
    {
      id: 1,
      title: 'Filtro por Condomínio',
      desc: 'Seria ótimo poder filtrar demandas pelo nome do condomínio.',
      status: 'Planejado',
      votes: 12,
    },
    {
      id: 2,
      title: 'Integração CRM',
      desc: 'Conectar com RD Station para puxar os leads automaticamente.',
      status: 'Pendente',
      votes: 8,
    },
    {
      id: 3,
      title: 'Chat Interno',
      desc: 'Comunicação direta sem precisar ir pro WhatsApp.',
      status: 'Implementado',
      votes: 45,
    },
  ]

  const handleVote = () => toast.success('Voto computado!')

  const handleSubmit = async () => {
    await sendTransactionalEmail('new_suggestion', { subject: 'Nova Ideia Submetida' })
    toast.success('Sugestão enviada para análise.')
  }

  const getStatusColor = (status: string) => {
    if (status === 'Implementado') return 'bg-green-500/10 text-green-500 border-green-500/20'
    if (status === 'Planejado') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-secondary text-muted-foreground border-border'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Comunidade e Sugestões</h2>
        <p className="text-muted-foreground text-base">
          Ajudou a implementar? Ganhe 1 mês de crédito no Prime Circle.
        </p>
      </div>

      <Card className="bg-card border-primary/20 shadow-[0_0_15px_rgba(201,168,76,0.05)]">
        <CardHeader>
          <CardTitle className="text-lg text-white">Sugerir Funcionalidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Descreva sua ideia em detalhes..."
            className="bg-background border-border text-white min-h-[100px]"
          />
          <Button onClick={handleSubmit} className="gold-gradient text-black font-semibold">
            Enviar para Votação
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {suggestions.map((sug) => (
          <Card key={sug.id} className="bg-secondary border-border overflow-hidden">
            <CardContent className="p-0 flex">
              <div className="flex flex-col items-center justify-start p-4 bg-background/50 border-r border-border min-w-[70px]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVote}
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <ThumbsUp className="w-5 h-5" />
                </Button>
                <span className="font-bold text-white mt-1">{sug.votes}</span>
              </div>
              <div className="flex-1 p-4 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-semibold text-white text-lg">{sug.title}</h3>
                  <Badge
                    variant="outline"
                    className={`whitespace-nowrap ${getStatusColor(sug.status)}`}
                  >
                    {sug.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{sug.desc}</p>
                {sug.status === 'Implementado' && (
                  <div className="text-xs text-primary font-medium flex items-center mt-2">
                    <ArrowRight className="w-3 h-3 mr-1" /> Autor recompensado com 1 mês de acesso
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
