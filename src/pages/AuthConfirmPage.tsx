import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, Mail, KeyRound, Loader2 } from 'lucide-react'
import useAppStore from '@/stores/main'
import { sendTransactionalEmail } from '@/lib/email'
import { toast } from 'sonner'

export default function AuthConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAppStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Informe seu e-mail')

    setIsLoading(true)
    await sendTransactionalEmail('magic_link_otp', { to: email })
    setIsLoading(false)
    setCooldown(60)
    toast.success('Link mágico enviado! Verifique sua caixa de entrada.')
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Preencha todos os campos')

    setIsLoading(true)
    setTimeout(() => {
      login(email, 'password')
      const dest = location.state?.from?.pathname || '/dashboard'
      navigate(dest)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-elevation animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <Crown className="w-10 h-10 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-white text-center">Acesso Exclusivo</h1>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Autentique-se para entrar no seu círculo.
          </p>
        </div>

        <Tabs defaultValue="magic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary border border-border">
            <TabsTrigger
              value="magic"
              className="data-[state=active]:bg-background data-[state=active]:text-primary"
            >
              <Mail className="w-4 h-4 mr-2" /> Link Mágico
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-background data-[state=active]:text-primary"
            >
              <KeyRound className="w-4 h-4 mr-2" /> Senha
            </TabsTrigger>
          </TabsList>

          <TabsContent value="magic">
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email Profissional</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="joao@primecircle.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || cooldown > 0}
                className="w-full gold-gradient text-black font-semibold h-12"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : cooldown > 0 ? (
                  `Aguarde ${cooldown}s`
                ) : (
                  'Enviar Link de Acesso Seguro'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pass-email">Email Profissional</Label>
                <Input
                  id="pass-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full border-primary text-primary hover:bg-primary/10 h-12 bg-transparent border-2 font-semibold"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar com Senha'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
