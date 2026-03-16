import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Home, FileText } from 'lucide-react'
import useAppStore from '@/stores/main'

export default function PendingPage() {
  const { login } = useAppStore()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center py-12 px-4 rounded-2xl bg-card border border-border">
        <Clock className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Sua solicitação está em análise</h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Nossa equipe está verificando seu CRECI e referências no mercado da Barra da Tijuca. Isso
          garante que nosso círculo permaneça exclusivo e de alta qualidade.
        </p>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
          onClick={() => login('approved')}
        >
          Simular Aprovação (Admin)
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Preparar Inventário
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="mb-4">
              Enquanto aguarda, você pode adiantar o cadastro dos seus imóveis exclusivos. Eles
              ficarão em modo rascunho até sua aprovação.
            </p>
            <Button className="w-full bg-background hover:bg-background/80 text-white border border-border">
              Adicionar Imóvel (Rascunho)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Listar Demandas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="mb-4">
              Tem clientes buscando algo específico na Barra? Cadastre a demanda agora para agilizar
              o match assim que entrar.
            </p>
            <Button className="w-full bg-background hover:bg-background/80 text-white border border-border">
              Adicionar Demanda (Rascunho)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
