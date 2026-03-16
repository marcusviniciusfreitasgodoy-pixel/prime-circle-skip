import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Mail } from 'lucide-react'

export default function Apply() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Aplicação enviada com sucesso!',
        description: 'Em breve entraremos em contato. Dúvidas? Fale com contato@primecircle.app.br',
      })
      setIsSubmitting(false)
      navigate('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-xl relative z-10">
          <div className="bg-card/80 backdrop-blur-sm p-8 sm:p-12 rounded-2xl border border-border shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Aplicar para o <span className="text-primary">Prime Circle</span>
            </h1>
            <p className="text-muted-foreground mb-10 text-lg">
              Preencha seus dados para avaliação do nosso comitê de admissão.
            </p>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base">
                  Nome Completo
                </Label>
                <Input
                  required
                  id="name"
                  placeholder="Ex: João da Silva"
                  className="bg-background h-12 text-base border-border/50 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="creci" className="text-base">
                  CRECI
                </Label>
                <Input
                  required
                  id="creci"
                  placeholder="Ex: 000000-F"
                  className="bg-background h-12 text-base border-border/50 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="linkedin" className="text-base">
                  LinkedIn ou Instagram Profissional
                </Label>
                <Input
                  required
                  id="linkedin"
                  type="url"
                  placeholder="https://"
                  className="bg-background h-12 text-base border-border/50 focus-visible:ring-primary"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full text-lg h-14 font-semibold shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Aplicação'}
                </Button>
              </div>

              <div className="pt-6 mt-6 border-t border-border/50 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Precisa de ajuda com sua aplicação?
                </p>
                <a
                  href="mailto:contato@primecircle.app.br"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  contato@primecircle.app.br
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
