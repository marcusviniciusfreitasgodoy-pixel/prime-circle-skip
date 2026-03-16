import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp } from 'lucide-react'

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
      status: 'Em Análise',
      votes: 8,
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Sugestões e Melhorias</h2>
        <p className="text-muted-foreground text-sm">Ajude a moldar o futuro do Prime Circle.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Nova Sugestão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Descreva sua ideia..."
            className="bg-background border-border text-white min-h-[100px]"
          />
          <Button className="gold-gradient">Enviar Ideia</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {suggestions.map((sug) => (
          <Card key={sug.id} className="bg-secondary border-border">
            <CardContent className="p-4 flex gap-4">
              <div className="flex flex-col items-center justify-center p-2 bg-background rounded-lg border border-border min-w-[60px]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-primary"
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <span className="font-bold text-white mt-1">{sug.votes}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white">{sug.title}</h3>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {sug.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sug.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
