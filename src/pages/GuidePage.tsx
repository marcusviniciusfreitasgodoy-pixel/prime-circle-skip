import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Scale, Workflow, Lightbulb, ShieldCheck, ArrowLeft, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useSEO } from '@/hooks/use-seo'

export default function GuidePage() {
  useSEO({
    title: 'Guia Prático | Prime Circle',
    description:
      'Aprenda como extrair o máximo da plataforma Prime Circle e fechar mais parcerias.',
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div>
        <Button
          variant="ghost"
          asChild
          className="text-muted-foreground hover:text-white mb-4 -ml-4"
        >
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Guia Prático: Extraindo 100% do Prime Circle
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">
          O manual definitivo para você dominar a plataforma, construir reputação e fechar as
          melhores parcerias.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <Scale className="w-5 h-5" /> 1. A Regra de Ouro (Compromisso 50/50)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              O Prime Circle não é um grupo comum. Nós operamos sob um código de ética rigoroso.
              <strong>A premissa base de toda conexão é a divisão exata de 50/50</strong> em todas
              as transações facilitadas pela plataforma.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Não tente renegociar a comissão para 60/40 ou outra proporção após o match.</li>
              <li>
                A transparência é fundamental: comunique sempre o status real da negociação ao
                parceiro.
              </li>
              <li>A quebra desta diretriz resulta em banimento irreversível da rede.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <Workflow className="w-5 h-5" /> 2. Fluxo de Trabalho (Como fechar negócios)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                  A
                </div>
                Central de Demandas
              </h3>
              <p>
                Não encontrou o imóvel ideal para seu cliente? Não perca a venda. Cadastre a
                necessidade na aba <strong>Demandas</strong>. A plataforma alertará todos os
                corretores da região que possuem imóveis compatíveis. Você receberá notificações
                assim que um match for encontrado.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                  B
                </div>
                Cadastro de Imóveis (Off-Market)
              </h3>
              <p>
                Cadastre suas captações na aba <strong>Imóveis</strong>. Você pode marcá-las como
                "Off-Market", assim saberemos que o imóvel tem uma condição diferenciada aqui na
                plataforma ou que não está sendo divulgado em portais imobiliários. Ele ficará
                disponível para o cruzamento inteligente da nossa IA.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                  C
                </div>
                Gestão de Conexões (Matches)
              </h3>
              <p>
                Quando um Imóvel cruza com uma Demanda, um "Match" é gerado. Acesse a aba{' '}
                <strong>Conexões</strong> para atualizar o status (Contato &gt; Visita &gt; Proposta
                &gt; Fechado). Manter o funil atualizado aumenta seu{' '}
                <strong>Score de Reputação</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <Star className="w-5 h-5" /> 3. Sistema de Reputação e Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              O ranking valoriza o engajamento e a eficiência. Quanto mais ativo você for nas
              negociações, maior será sua autoridade e destaque no Top 10 da comunidade. Todos
              iniciam com 0 pontos para garantir equidade.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mt-2">
              <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                <h4 className="text-white text-sm font-semibold flex items-center gap-2 mb-2">
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">
                    +2 pts
                  </span>
                  Avanço de Negociações
                </h4>
                <p className="text-xs">
                  Sempre que uma parceria progride (ex: visita ou proposta). Cancelamentos ou
                  rejeições não pontuam.
                </p>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                <h4 className="text-white text-sm font-semibold flex items-center gap-2 mb-2">
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">
                    +5 pts
                  </span>
                  Atualizações Rápidas
                </h4>
                <p className="text-xs">
                  Uso dos links de atualização rápida recebidos via WhatsApp garante dados em tempo
                  real e maior bonificação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> 4. Programa Embaixador e Curadoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              A rede cresce por convite. No seu Dashboard ou Perfil, você encontrará seu link de
              convite. Convide corretores alinhados à nossa cultura. Ao atingir metas de indicações
              aprovadas, você sobe de nível (Silver, Gold, Elite) e destrava meses de acesso grátis
              e descontos vitalícios.
            </p>
            <p>
              <strong>Status de Elite (Reputação &gt; 80 pts):</strong> Corretores com alta
              reputação ganham o poder de validar novos membros que entram na fila de espera,
              ajudando na curadoria da rede.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <Lightbulb className="w-5 h-5" /> 5. Cultura Colaborativa (Sugestões)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Nossa plataforma é construída a várias mãos. Sentiu falta de um filtro? Tem uma ideia
              de funcionalidade que facilitaria seu trabalho?
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Acesse a aba <strong>Sugestões</strong> e envie sua ideia.
              </li>
              <li>A comunidade vota nas melhores propostas.</li>
              <li>
                Para cada sugestão sua que for aprovada e desenvolvida por nós,{' '}
                <strong>adicionamos 1 mês de crédito extra na sua assinatura</strong>.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          asChild
          className="gold-gradient text-black font-bold h-12 px-8 shadow-[0_0_15px_rgba(201,168,76,0.2)] hover:scale-105 transition-transform duration-300"
        >
          <Link to="/dashboard">Ir para o Meu Painel</Link>
        </Button>
      </div>
    </div>
  )
}
