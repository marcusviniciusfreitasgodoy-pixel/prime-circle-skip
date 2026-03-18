import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-24 max-w-4xl animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Termos de Uso</h1>
          <p className="text-muted-foreground text-lg">
            Diretrizes legais e regras operacionais do ecossistema Prime Circle.
          </p>
        </div>

        <Card className="bg-card border-primary/20 shadow-elevation">
          <CardContent className="p-8 space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Planos e Mensalidades</h2>
              <p>
                A infraestrutura do Prime Circle atua sob um modelo de assinatura de{' '}
                <strong className="text-white">R$ 97,00 mensais</strong> para membros padrão e
                acessos com trial expirado. Corretores aprovados no <strong>Plano Founder</strong>{' '}
                recebem um período de carência com 12 meses de acesso gratuito, contados
                estritamente a partir da data de ativação da assinatura (
                <code className="bg-secondary text-primary px-1.5 py-0.5 rounded text-sm">
                  plan_started_at
                </code>
                ).
              </p>
            </section>

            <Separator className="bg-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Programa Ambassador</h2>
              <p>
                Membros ativos podem participar do Programa Ambassador convidando parceiros de alto
                nível. Dependendo da sua contribuição e volume de indicações aprovadas, seu perfil
                será classificado em diferentes Tiers (níveis), podendo receber benefícios
                exclusivos e descontos vitalícios de{' '}
                <strong className="text-white">20% ou 30%</strong> em sua assinatura.
              </p>
            </section>

            <Separator className="bg-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                3. Regras de Atividade e Suspensão
              </h2>
              <p>
                A liquidez da plataforma exige engajamento. A inatividade prolongada prejudica todos
                os membros do Núcleo Regional. Se for detectada inatividade superior a{' '}
                <strong className="text-white">60 dias</strong> (monitorado via a métrica
                <code className="bg-secondary text-primary px-1.5 py-0.5 rounded text-sm ml-1">
                  last_contribution_at
                </code>
                ), seus benefícios de plano e privilégios do Programa Ambassador serão
                automaticamente suspensos pelo sistema.
              </p>
            </section>

            <Separator className="bg-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                4. Programa Colaborativo (Sugestões)
              </h2>
              <p>
                No Prime Circle, a evolução é conjunta. Ao submeter ideias, você concorda em ceder
                os direitos de implementação das mesmas para a plataforma. Como forma de
                agradecimento financeiro pela co-criação, para{' '}
                <strong>cada sugestão sua que for aprovada e implementada</strong>, sua conta será
                bonificada com <strong className="text-primary">1 mês extra de acesso</strong>{' '}
                adicionado imediatamente ao seu plano.
              </p>
            </section>

            <Separator className="bg-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Conduta Ética 50/50</h2>
              <p>
                A premissa base de toda conexão é a divisão exata de 50/50 em todas as transações
                facilitadas pela plataforma. A quebra desta diretriz resulta em banimento
                irreversível da rede Prime Circle.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
