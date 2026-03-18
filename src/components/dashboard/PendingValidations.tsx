import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, UserCheck, Lock } from 'lucide-react'

export function PendingValidations() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [myProfileData, setMyProfileData] = useState<any>(null)

  useEffect(() => {
    if (!user) return

    const fetchPending = async () => {
      setLoading(true)
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('id, reputation_score, role')
        .eq('id', user.id)
        .single()

      if (myProfile) {
        setMyProfileData(myProfile)
        const refCode = myProfile.id

        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, creci, whatsapp_number, created_at')
          .eq('status', 'pending_validation')
          .eq('referral_code', refCode)

        if (data) setPendingUsers(data)
      }
      setLoading(false)
    }

    fetchPending()
  }, [user])

  const handleValidate = async (targetId: string) => {
    if (!user) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'active',
        validated_by: user.id,
        validation_date: new Date().toISOString(),
      })
      .eq('id', targetId)

    if (updateError) {
      toast({
        title: 'Erro de Permissão',
        description: 'Não foi possível validar o membro. Verifique sua reputação.',
        variant: 'destructive',
      })
      return
    }

    if (myProfileData) {
      const newScore = (myProfileData.reputation_score || 0) + 5
      await supabase.from('profiles').update({ reputation_score: newScore }).eq('id', user.id)

      setMyProfileData({ ...myProfileData, reputation_score: newScore })
    }

    toast({
      title: 'Membro Validado',
      description: 'O membro agora tem acesso total e você ganhou +5 pontos de reputação!',
    })
    setPendingUsers((prev) => prev.filter((p) => p.id !== targetId))
  }

  if (loading) return null

  // Check if user is eligible to validate others (score > 80 or admin)
  const isEligible = myProfileData?.role === 'admin' || (myProfileData?.reputation_score ?? 0) > 80

  if (!isEligible) {
    return (
      <Card className="bg-card border-red-900/30 bg-red-950/10 mb-8 animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-red-400">
            <Lock className="w-5 h-5" /> Privilégios de Curadoria Bloqueados
          </CardTitle>
          <CardDescription className="text-red-300/70 text-base leading-relaxed">
            Seu PrimeCircle Score atual é <strong>{myProfileData?.reputation_score || 0}</strong>. É
            necessário atingir <strong>mais de 80 pontos</strong> para validar os corretores
            indicados por você. Continue engajando e fechando parcerias na rede para recuperar seus
            privilégios.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (pendingUsers.length === 0) return null

  return (
    <Card className="bg-card border-primary/30 shadow-[0_0_30px_rgba(201,168,76,0.1)] mb-8 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" /> Curadoria da Rede (Membros Pendentes)
        </CardTitle>
        <CardDescription>
          Estes corretores usaram seu código de indicação. Como membro de Alta Reputação (Elite),
          você tem a autoridade para validar o acesso deles à plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {pendingUsers.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-secondary/50 rounded-lg border border-border flex flex-col sm:flex-row justify-between gap-4"
            >
              <div>
                <h4 className="font-bold text-white text-lg">{p.full_name || 'Corretor'}</h4>
                <p className="text-sm text-muted-foreground">
                  {p.creci ? `CRECI: ${p.creci}` : 'CRECI não informado'}
                </p>
                <p className="text-sm text-muted-foreground">{p.whatsapp_number}</p>
              </div>
              <Button
                onClick={() => handleValidate(p.id)}
                className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30 whitespace-nowrap h-10 self-start sm:self-center"
              >
                <UserCheck className="w-4 h-4 mr-2" /> Validar Membro
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
