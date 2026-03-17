import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Gift, Lightbulb, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  category: z.string().min(1, 'Selecione uma categoria'),
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'Detalhe mais a sua sugestão'),
  impact: z.string().min(1, 'Selecione o impacto esperado'),
})

export default function PublicSuggestionsPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      category: '',
      title: '',
      description: '',
      impact: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // Simulate API submission
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-24 max-w-5xl animate-fade-in-up">
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:text-white mb-4 -ml-4"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-primary" /> Roadmap Colaborativo
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Sua visão de mercado é fundamental. Compartilhe suas ideias e ajude a construir as
            próximas inovações do ecossistema Prime Circle.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!isSubmitted ? (
              <Card className="bg-card border-border shadow-elevation">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Nova Sugestão</CardTitle>
                  <CardDescription>
                    Preencha os dados abaixo para submeter sua ideia à nossa equipe de engenharia.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Nome Completo</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Seu nome"
                                  {...field}
                                  className="bg-background"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Email Profissional</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Seu email"
                                  type="email"
                                  {...field}
                                  className="bg-background"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Categoria</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="new_feature">Nova Funcionalidade</SelectItem>
                                  <SelectItem value="ux">Melhoria de Design/UX</SelectItem>
                                  <SelectItem value="performance">Performance</SelectItem>
                                  <SelectItem value="bug">Reportar Bug</SelectItem>
                                  <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="impact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Impacto Esperado</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Qual o impacto?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="high">Alto (Muitos corretores)</SelectItem>
                                  <SelectItem value="medium">Médio (Uso frequente)</SelectItem>
                                  <SelectItem value="low">Baixo (Uso específico)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Título da Sugestão</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Resuma sua ideia em poucas palavras"
                                {...field}
                                className="bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Descrição Detalhada</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explique como essa funcionalidade ajudaria no seu dia a dia..."
                                {...field}
                                className="bg-background min-h-[120px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto h-12 px-8 gold-gradient text-black font-bold text-base"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          'Enviar Sugestão'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-secondary/50 border-primary/50 flex flex-col items-center justify-center p-12 text-center shadow-[0_0_30px_rgba(201,168,76,0.1)]">
                <CheckCircle2 className="w-20 h-20 text-primary mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Sugestão Recebida!</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  Muito obrigado por contribuir com a evolução do Prime Circle. Nossa equipe vai
                  avaliar sua ideia e ela poderá entrar em nosso próximo ciclo de desenvolvimento.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline">
                  Enviar Nova Sugestão
                </Button>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(201,168,76,0.15)] relative overflow-hidden sticky top-28">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
              <CardHeader>
                <CardTitle className="text-primary text-xl flex items-center gap-2">
                  <Gift className="w-6 h-6" /> Recompensa de Parceria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-zinc-300 leading-relaxed relative z-10">
                <p>
                  O Prime Circle valoriza profundamente o tempo e a inteligência dos parceiros que
                  ajudam a construir a plataforma.
                </p>
                <div className="p-4 bg-background/50 border border-primary/20 rounded-lg">
                  <p className="font-semibold text-white mb-1">Como funciona?</p>
                  <p>
                    Se a sua sugestão for aprovada pelo comitê e implementada na plataforma, sua
                    conta será recompensada imediatamente com{' '}
                    <strong className="text-primary font-bold">1 mês de crédito extra</strong> na
                    sua assinatura vigente.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  *Não há limite de sugestões por parceiro. Múltiplas implementações acumulam
                  múltiplos meses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
