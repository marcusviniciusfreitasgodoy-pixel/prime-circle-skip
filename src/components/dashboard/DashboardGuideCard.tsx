import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardGuideCard() {
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30 shadow-sm relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <BookOpen className="w-24 h-24 text-primary" />
      </div>
      <CardContent className="p-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Novo por aqui? Veja como extrair 100% da rede
            </h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Entenda as Regras de Ouro, como usar a Central de Demandas e as melhores práticas para
              fechar negócios com parceiros.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="shrink-0 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 font-semibold"
        >
          <Link to="/guide">
            Acessar Guia Prático <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
