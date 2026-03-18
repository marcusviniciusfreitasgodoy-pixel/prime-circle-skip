import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowLeft, Map, Activity, CheckCircle2, Hammer } from 'lucide-react'
import useAppStore, { SuggestionStatus } from '@/stores/main'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function RoadmapPage() {
  const { suggestions, voteSuggestion } = useAppStore()

  const columns: { id: SuggestionStatus; title: string; color: string; bg: string; icon: any }[] = [
    {
      id: 'Em Análise',
      title: 'Em Análise',
      color: 'border-zinc-500',
      bg: 'bg-zinc-500/10 text-zinc-400',
      icon: Activity,
    },
    {
      id: 'Em Desenvolvimento',
      title: 'Em Desenvolvimento',
      color: 'border-blue-500',
      bg: 'bg-blue-500/10 text-blue-400',
      icon: Hammer,
    },
    {
      id: 'Entregue',
      title: 'Entregue',
      color: 'border-primary',
      bg: 'bg-primary/10 text-primary',
      icon: CheckCircle2,
    },
  ]

  const handleVote = (id: string) => {
    voteSuggestion(id)
    toast.success('Seu voto foi registrado com sucesso!')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Map className="w-8 h-8 text-primary" /> Cronograma de Evolução em Tempo Real
          </h2>
          <p className="text-muted-foreground text-base mt-2 max-w-2xl">
            Acompanhe as prioridades da plataforma e o impacto das suas ideias no ecossistema Prime
            Circle.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-border text-muted-foreground hover:text-white shrink-0 h-11"
        >
          <Link to="/suggestions">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Sugestões
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.id} className="space-y-4">
            <div
              className={cn(
                'bg-card border-t-2 rounded-xl p-5 shadow-elevation flex items-center justify-between',
                col.color,
              )}
            >
              <div className="flex items-center gap-2">
                <col.icon className={cn('w-5 h-5', col.color.replace('border-', 'text-'))} />
                <h3 className="font-bold text-white text-lg">{col.title}</h3>
              </div>
              <Badge variant="outline" className={cn('border-none', col.bg)}>
                {suggestions.filter((s) => s.status === col.id).length}
              </Badge>
            </div>

            <div className="space-y-4">
              {suggestions
                .filter((s) => s.status === col.id)
                .sort((a, b) => b.votes - a.votes)
                .map((sug) => (
                  <Card
                    key={sug.id}
                    className="bg-secondary border-border hover:border-primary/40 transition-colors shadow-none hover:shadow-elevation group"
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start gap-3">
                        <Badge
                          variant="outline"
                          className="bg-background border-border text-[10px] uppercase tracking-wider text-muted-foreground"
                        >
                          {sug.category || 'Geral'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(sug.id)}
                          className="h-8 gap-1.5 border-primary/20 hover:bg-primary/20 text-primary transition-all group-hover:scale-105"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                          <span className="font-bold">{sug.votes}</span>
                        </Button>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-base leading-snug mb-2">
                          {sug.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {sug.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {suggestions.filter((s) => s.status === col.id).length === 0 && (
                <div className="p-8 text-center border border-dashed border-border rounded-xl">
                  <p className="text-sm text-muted-foreground">Nenhuma sugestão nesta etapa.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
