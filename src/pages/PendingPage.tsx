import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Home, FileText } from 'lucide-react'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'
import { sendTransactionalEmail } from '@/lib/email'

export default function PendingPage() {
  const navigate = useNavigate()
  const { logout } = useAppStore()

  const handleSimulateApproval = async () => {
    toast.info('Simulando envio de e-mail mágico...')
    await sendTransactionalEmail('Magic Link Email', { to: 'pending@user.com' })
    toast.success('E-mail enviado! Redirecionando para o link seguro.')
    logout()
    setTimeout(() => navigate('/auth/confirm'), 1500)
  }

  const handleDraft = (type: string) => {
    toast.success(`Rascunho de ${type} salvo com sucesso! Ficará visível após aprovação.`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up py-12 px-4">
      <div className="text-center py-12 px-6 rounded-2xl bg-card border border-border shadow-elevation">
        <Clock className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Sua solicitação está em análise</h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
          Nossa equipe está verificando seu CRECI e referências no mercado da Barra da Tijuca. Essa
          curadoria rigorosa garante que o círculo permaneça focado em alta performance.
        </p>
        <div className="inline-block p-4 border border-primary/20 bg-primary/5 rounded-xl">
          <p className="text-sm text-primary font-medium mb-3">Área de Teste (Admin)</p>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/20 bg-transparent w-full"
            onClick={handleSimulateApproval}
          >
            Simular Aprovação (Receber Link Mágico)
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-secondary border-border hover:border-primary/30 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Preparar Inventário
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex flex-col justify-between h-[120px]">
            <p className="text-sm">
              Adiante o cadastro dos seus imóveis exclusivos. Eles ficarão em modo rascunho até sua
              aprovação.
            </p>
            <Button
              onClick={() => handleDraft('imóvel')}
              className="w-full bg-background hover:bg-background/80 text-white border border-border"
            >
              Adicionar Imóvel (Rascunho)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-border hover:border-primary/30 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Listar Demandas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex flex-col justify-between h-[120px]">
            <p className="text-sm">
              Tem clientes buscando algo específico? Cadastre a demanda agora para agilizar o match.
            </p>
            <Button
              onClick={() => handleDraft('demanda')}
              className="w-full bg-background hover:bg-background/80 text-white border border-border"
            >
              Adicionar Demanda (Rascunho)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
