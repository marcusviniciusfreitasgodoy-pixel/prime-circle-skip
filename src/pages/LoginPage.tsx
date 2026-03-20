import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, Mail, KeyRound, Loader2 } from 'lucide-react'
import useAppStore from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { useSEO } from '@/hooks/use-seo'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  useSEO({
    title: 'Acesso Exclusivo | Prime Circle',
    description:
      'Autentique-se para acessar o seu painel do Prime Circle e gerenciar suas conexões de alto padrão.',
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { login, user: mockUser } = useAppStore()
  const { signIn, signInWithOtp, user: authUser, loading: authLoading } = useAuth()

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

  useEffect(() => {
    if (!authLoading && (authUser || mockUser)) {
      const dest = location.state?.from?.pathname || '/dashboard'
      navigate(dest, { replace: true })
    }
  }, [authUser, mockUser, authLoading, navigate, location])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return toast.error('Informe seu e-mail')

    setIsLoading(true)
    const redirectTo = `${window.location.origin}/auth/confirm`

    try {
      const { error } = await signInWithOtp(cleanEmail, redirectTo)

      let userId: string | null = null
      try {
        const { data } = await supabase.rpc('get_user_id_by_email', { p_email: cleanEmail })
        if (data) userId = data
      } catch (err) {
        console.error('Failed to resolve user ID:', err)
      }

      if (error) {
        const errorMessage = error.message || ''
        const isEmailError =
          errorMessage.includes('Error sending confirmation email') ||
          errorMessage.includes('rate_limit') ||
          (error as any)?.name === 'unexpected_failure' ||
          (error as any)?.status === 500

        if (isEmailError) {
          toast.error(
            'Não foi possível enviar o e-mail no momento. Por favor, verifique se o endereço está correto ou tente novamente em alguns minutos.',
          )
        } else {
          toast.error(`Falha ao enviar link: ${errorMessage || 'Erro desconhecido'}`)
        }

        if (userId) {
          try {
            await supabase.rpc('log_notification', {
              p_user_id: userId,
              p_recipient: cleanEmail,
              p_channel: 'email',
              p_status: 'failed',
              p_message_body: `Solicitação de Magic Link para ${redirectTo}`,
              p_error_details: errorMessage || 'Unknown error',
            })
          } catch (logErr) {
            console.error('Failed to log notification error:', logErr)
          }
        }
      } else {
        toast.success('Link de acesso enviado! Verifique sua caixa de entrada e spam.')
        setCooldown(60)
        if (userId) {
          try {
            await supabase.rpc('log_notification', {
              p_user_id: userId,
              p_recipient: cleanEmail,
              p_channel: 'email',
              p_status: 'success',
              p_message_body: `Solicitação de Magic Link para ${redirectTo}`,
            })
          } catch (logErr) {
            console.error('Failed to log success notification:', logErr)
          }
        }
      }
    } catch (err: any) {
      console.error('Unexpected error during magic link:', err)
      toast.error('Ocorreu um erro inesperado ao processar sua solicitação.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) return toast.error('Preencha todos os campos')

    setIsLoading(true)
    try {
      const { error } = await signIn(cleanEmail, password)

      if (error) {
        const authError = error as any
        if (
          (authError.status === 400 && authError.code === 'email_not_confirmed') ||
          authError.message?.includes('Email not confirmed') ||
          authError.code === 'email_not_confirmed'
        ) {
          toast.error(
            'Email not confirmed. Please check your inbox and confirm your email address before logging in.',
          )
        } else {
          toast.error('Credenciais inválidas.')
        }
        setIsLoading(false)
        return
      }

      login(cleanEmail, 'password')
      // Navigation is now handled by the useEffect after confirming session
    } catch (err: any) {
      if (
        (err?.status === 400 && err?.code === 'email_not_confirmed') ||
        err?.message?.includes('Email not confirmed') ||
        err?.code === 'email_not_confirmed'
      ) {
        toast.error(
          'Email not confirmed. Please check your inbox and confirm your email address before logging in.',
        )
      } else {
        toast.error('Ocorreu um erro ao fazer login.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || authUser || mockUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
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
