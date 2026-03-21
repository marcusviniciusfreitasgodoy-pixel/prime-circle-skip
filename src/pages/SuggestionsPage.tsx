import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ThumbsUp, ArrowRight, Trophy, Map, BrainCircuit, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
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
  const [newCategory, setNewCategory] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
    if (!newTitle || !newDesc || !newCategory)
      return toast.error('Preencha título, descrição e categoria.')

    setIsAnalyzing(true)

    // Simulate AI evaluation delay
    setTimeout(async () => {
      setIsAnalyzing(false)
      await sendTransactionalEmail('new_suggestion', { subject: 'Nova Ideia Submetida' })
      addSuggestion(newTitle, newDesc, newCategory)
      setNewTitle('')
      setNewDesc('')
      setNewCategory('')
      toast.success('Sua sugestão foi avaliada pela IA e enviada para análise!')
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    if (status === 'Entregue') return 'bg-green-500/10 text-green-500 border-green-500/20'
    if (status === 'Em Desenvolvimento') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-secondary text-muted-foreground border-border'
  }

  const sortedRanking = [...communityMembers].sort((a, b) => {
    const ptsA = (a.suggestionPoints || 0) + a.suggestionMonthsCredited * 100
    const ptsB = (b.suggestionPoints || 0) + b.suggestionMonthsCredited * 100
    if (ptsB !== ptsA) return ptsB - ptsA
    return b.suggestionsImplemented - a.suggestionsImplemented
  })

  const userPoints = user?.suggestionPoints || 0
  const progressValue = Math.min(100, userPoints)

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Comunidade e Sugestões</h2>
          <p className="text-muted-foreground text-base">
            Envie ideias, acumule pontos e ganhe{' '}
            <strong className="text-primary">mensalidades grátis</strong> no Prime Circle.
          </p>
        </div>
        <Button
          asChild
          className="gold-gradient text-black font-semibold h-11 px-6 shadow-[0_0_15px_rgba(201,168,76,0.2)]"
        >
          <Link to="/roadmap">
            <Map className="w-4 h-4 mr-2" /> Ver Cronograma de Evolução
          </Link>
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-secondary to-background border-primary/20 shadow-[0_0_20px_rgba(201,168,76,0.1)] relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none p-4">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                Programa de Recompensas (AI Scoring)
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                A IA do Prime Circle avalia a complexidade das suas ideias. A cada 100 pontos
                acumulados com implementações, você ganha 1 mês grátis!
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">{userPoints}</span>
              <span className="text-muted-foreground">/100 pts</span>
            </div>
          </div>
          <Progress
            value={progressValue}
            className="h-3 bg-background border border-border"
            indicatorClassName="bg-primary"
          />
          <p className="text-xs text-muted-foreground mt-3 text-right">
            {userPoints >= 100
              ? 'Parabéns! Você já pode resgatar seu mês grátis.'
              : `Faltam ${100 - userPoints} pontos para a próxima recompensa.`}
          </p>
        </CardContent>
      </Card>

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
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="bg-background border-border text-muted-foreground mb-2">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nova Funcionalidade">Nova Funcionalidade</SelectItem>
                  <SelectItem value="Experiência (UX)">Experiência (UX)</SelectItem>
                  <SelectItem value="Integrações">Integrações</SelectItem>
                  <SelectItem value="Melhoria de Performance">Melhoria de Performance</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Descreva sua ideia em detalhes..."
                className="bg-background border-border text-white min-h-[100px]"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <Button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="gold-gradient text-black font-semibold mt-2 min-w-[220px]"
              >
                {isAnalyzing ? (
                  <>
                    <BrainCircuit className="w-4 h-4 mr-2 animate-pulse" /> Analisando com IA...
                  </>
                ) : (
                  'Enviar para Análise'
                )}
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
                      <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className="bg-background border-border text-[10px] uppercase text-muted-foreground"
                            >
                              {sug.category || 'Geral'}
                            </Badge>
                            {sug.complexity && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] uppercase border',
                                  sug.complexity === 'Alta'
                                    ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                                    : sug.complexity === 'Média'
                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                      : 'bg-green-500/10 text-green-400 border-green-500/20',
                                )}
                              >
                                {sug.complexity === 'Alta' && <Sparkles className="w-3 h-3 mr-1" />}
                                {sug.complexity} ({sug.points} pts)
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-white text-lg leading-tight mt-1">
                            {sug.title}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={`whitespace-nowrap ${getStatusColor(sug.status)}`}
                        >
                          {sug.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{sug.desc}</p>
                      {sug.status === 'Entregue' && sug.points && (
                        <div className="text-xs text-primary font-medium flex items-center mt-2 bg-primary/10 p-2 rounded-md border border-primary/20 w-fit">
                          <ArrowRight className="w-3 h-3 mr-1" /> Autor recompensado com +
                          {sug.points} pontos
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
                <Trophy className="w-5 h-5 text-primary" /> Hall of Fame
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground py-3">Membro</TableHead>
                    <TableHead className="text-right text-muted-foreground py-3">Score</TableHead>
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
                              'w-4 text-xs font-bold text-center',
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
                              {member.suggestionsImplemented} aprovações
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <div className="flex flex-col items-end">
                            <span className="text-primary font-bold text-sm">
                              {member.suggestionPoints || 0} pts
                            </span>
                            {member.suggestionMonthsCredited > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{member.suggestionMonthsCredited} mês
                              </span>
                            )}
                          </div>
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
