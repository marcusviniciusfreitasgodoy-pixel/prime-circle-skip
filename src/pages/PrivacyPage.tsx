import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-24 max-w-4xl animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Política de Privacidade</h1>
          <p className="text-muted-foreground text-lg">
            Transparência sobre a coleta, uso e segurança dos seus dados.
          </p>
        </div>

        <Card className="bg-card border-primary/20 shadow-elevation">
          <CardContent className="p-8 space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Coleta de Dados</h2>
              <p>
                Para prover uma infraestrutura privada e confiável, coletamos{' '}
                <strong>dados de perfil</strong> (incluindo nome, e-mail, telefone, CRECI, ticket de
                atuação e Chapter) e mantemos <strong>logs de atividade</strong> e status (cadastros
                de imóveis, interações com demandas, fechamentos de conexões).
              </p>
            </section>

            <Separator className="bg-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Uso das Informações</h2>
              <p>
                Todos os dados recolhidos pelo Prime Circle têm uma finalidade estrita:
                <strong className="text-white">
                  {' '}
                  melhorar a eficiência colaborativa da rede
                </strong>{' '}
                e assegurar o cumprimento das regras. Nós não comercializamos, compartilhamos ou
                vendemos listas de leads, e os imóveis/demandas operam isolados exclusivamente
                dentro do escopo do seu respectivo Chapter.
              </p>
            </section>

            <Separator className="bg-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                3. Notificações e Comunicações (E-mail)
              </h2>
              <p>
                Comunicações críticas utilizam o seu endereço de e-mail através da nossa
                infraestrutura integrada via <strong>Resend</strong>. O uso destas mensagens tem
                natureza exclusivamente transacional, cobrindo aspectos como:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                <li>
                  Avisos e alertas de <strong>expiração de plano</strong> (30 dias, 7 dias, etc).
                </li>
                <li>
                  Notificações do ciclo de avaliação e{' '}
                  <strong>status do programa de sugestões</strong> (ex: "Sua ideia foi
                  Implementada!").
                </li>
                <li>Envio de Links Mágicos e aprovação no comitê de admissão.</li>
              </ul>
            </section>

            <Separator className="bg-border" />

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Exclusão e Retenção</h2>
              <p>
                Você pode solicitar o descredenciamento e remoção das suas listagens ativas a
                qualquer momento. Para garantir a trilha de auditoria (audit trail) e estabilidade
                do match making preexistente, dados anonimizados de histórico de transações podem
                ser mantidos de acordo com as permissões da legislação vigente de proteção de dados
                aplicável ao território nacional.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
