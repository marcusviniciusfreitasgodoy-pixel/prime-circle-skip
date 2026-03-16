import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold mb-6 text-primary">404</h1>
      <h2 className="text-3xl font-semibold mb-4 text-center text-white">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md text-lg">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Button size="lg" asChild className="h-12 px-8 gold-gradient text-black">
        <Link to="/">Voltar para o início</Link>
      </Button>
    </div>
  )
}
