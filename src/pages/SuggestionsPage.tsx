import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ThumbsUp, ArrowRight, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { sendTransactionalEmail } from '@/lib/email'
import useAppStore from '@/stores/main'
import { cn } from '@/lib/utils'

export default function SuggestionsPage() {
  const {
    suggestions,
    communityMembers,
    user,
    addSuggestion,
    voteSuggestion,
    markSuggestionsAsViewed,
  } = useAppStore()
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const markRef = useRef(markSuggestionsAsViewed)

  useEffect(() => {
    markRef.current = markSuggestionsAsViewed
  }, [markSuggestionsAsViewed])

  useEffect(() => {
    markRef.current()
  }, [])

  const handleVote = (id: string) => {
    voteSuggestion(id)
    toast.success('Voto computado!')
  }

  const handleSubmit = async () => {
    if (!newTitle || !newDesc) return toast.error('Preencha título e descrição.')
    await sendTransactionalEmail('new_suggestion', { subject: 'Nova Ideia Submetida' })
    addSuggestion(newTitle, newDesc)
    setNewTitle('')
    setNewDesc('')
    toast.success('Sugestão enviada para análise.')
  }

  const getStatusColor = (status: string) => {
    if (status === 'Implementado') return 'bg-green-500/10 text-green-500 border-green-500/20'
    if (status === 'Planejado') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-secondary text-muted-foreground border-border'
  }

  const sortedRanking = [...communityMembers].sort((a, b) => {
    if (b.suggestionsImplemented !== a.suggestionsImplemented) {
      return b.suggestionsImplemented - a.suggestionsImplemented
    }
    return b.suggestionsSubmitted - a.suggestionsSubmitted
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Comunidade e Sugestões</h2>
        <p className="text-muted-foreground text-base">
          Ajudou a implementar? Ganhe{' '}
          <strong className="text-primary">1 mês de crédito extra</strong> na sua assinatura do
          Prime Circle.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-primary/20 shadow-[0_0_15px_rgba(201,168,76,0.05)]">
            <CardHeader>
              <CardTitle className="text-lg text-white">Sugerir Funcionalidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título da sugestão"
                className="bg-background border-border text-white mb-2"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Descreva sua ideia em detalhes..."
                className="bg-background border-border text-white min-h-[100px]"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <Button onClick={handleSubmit} className="gold-gradient text-black font-semibold">
                Enviar para Votação
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {suggestions
              .sort((a, b) => b.votes - a.votes)
              .map((sug) => (
                <Card key={sug.id} className="bg-secondary border-border overflow-hidden">
                  <CardContent className="p-0 flex">
                    <div className="flex flex-col items-center justify-start p-4 bg-background/50 border-r border-border min-w-[70px]">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVote(sug.id)}
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
                        <div className="text-xs text-primary font-medium flex items-center mt-2 bg-primary/10 p-2 rounded-md border border-primary/20 w-fit">
                          <ArrowRight className="w-3 h-3 mr-1" /> Autor recompensado com +1 mês de
                          acesso
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-card border-border sticky top-24">
            <CardHeader className="bg-secondary/50 border-b border-border pb-4">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground py-3">Membro</TableHead>
                    <TableHead className="text-right text-muted-foreground py-3">
                      Créditos
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRanking.map((member, i) => {
                    const isCurrentUser = member.id === user?.id
                    return (
                      <TableRow
                        key={member.id}
                        className={cn(
                          'border-border hover:bg-secondary/50',
                          isCurrentUser && 'bg-primary/5',
                        )}
                      >
                        <TableCell className="font-medium text-white flex items-center gap-3 py-3">
                          <span
                            className={cn(
                              'w-4 text-xs font-bold',
                              i === 0
                                ? 'text-yellow-400'
                                : i === 1
                                  ? 'text-gray-300'
                                  : i === 2
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground',
                            )}
                          >
                            {i + 1}º
                          </span>
                          <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm flex items-center gap-2">
                              {member.name.split(' ')[0]}
                              {isCurrentUser && (
                                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 px-1 py-0 text-[9px]">
                                  Você
                                </Badge>
                              )}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {member.suggestionsImplemented} implementadas
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <span className="text-primary font-bold">
                            {member.suggestionMonthsCredited}
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">mês</span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
