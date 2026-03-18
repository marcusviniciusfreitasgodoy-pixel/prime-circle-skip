import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AuthConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user: authUser, loading: authLoading, signOut } = useAuth()
  const [status, setStatus] = useState('Verificando credenciais...')

  useEffect(() => {
    // Extract parameters handling both Hash explicitly and query formats
    const hashParams = new URLSearchParams(location.hash.replace('#', '?'))
    const searchParams = new URLSearchParams(location.search)

    const error = hashParams.get('error') || searchParams.get('error')
    const errorDescription =
      hashParams.get('error_description') || searchParams.get('error_description')

    if (error) {
      if (
        errorDescription?.toLowerCase().includes('expired') ||
        errorDescription?.toLowerCase().includes('invalid')
      ) {
        toast.error('Link de acesso expirado ou inválido. Por favor, solicite um novo.')
      } else {
        toast.error('Ocorreu um erro ao validar seu acesso. Tente novamente.')
      }
      navigate('/login', { replace: true })
      return
    }

    const hasAuthParams =
      hashParams.get('access_token') || searchParams.get('code') || searchParams.get('token_hash')

    if (!authLoading && !authUser && !hasAuthParams) {
      navigate('/login', { replace: true })
      return
    }

    let mounted = true
    let retryCount = 0
    const maxRetries = 10

    const verifyProfile = async () => {
      if (!authUser) return

      setStatus('Sincronizando perfil...')

      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, status')
          .eq('id', authUser.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile isn't available yet, wait to allow triggers to finish
          if (retryCount < maxRetries) {
            retryCount++
            if (mounted) setTimeout(verifyProfile, 1000)
          } else {
            if (mounted) {
              toast.error(
                'Seu perfil ainda está sendo criado. Por favor, aguarde alguns minutos e tente novamente.',
              )
              await signOut()
              navigate('/login', { replace: true })
            }
          }
        } else if (!profileError && data && mounted) {
          setStatus('Acesso confirmado! Redirecionando...')
          toast.success('Login realizado com sucesso!')
          navigate('/dashboard', { replace: true })
        } else if (profileError && mounted) {
          toast.error('Erro ao verificar perfil. Tente novamente.')
          navigate('/login', { replace: true })
        }
      } catch (err) {
        console.error('Profile check error:', err)
        if (mounted) {
          toast.error('Erro de conexão ao verificar o perfil.')
          navigate('/login', { replace: true })
        }
      }
    }

    // Once Supabase SDK establishes the session based on the URL tokens, verify profile syncs.
    if (!authLoading && authUser) {
      verifyProfile()
    }

    return () => {
      mounted = false
    }
  }, [authUser, authLoading, navigate, location, signOut])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl border border-border shadow-elevation flex flex-col items-center max-w-sm w-full text-center animate-fade-in-up">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Autenticando</h1>
        <p className="text-muted-foreground text-sm">{status}</p>
      </div>
    </div>
  )
}
