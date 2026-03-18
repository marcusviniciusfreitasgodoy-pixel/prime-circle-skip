import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, UserCheck } from 'lucide-react'

export function PendingValidations() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchPending = async () => {
      setLoading(true)
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      const refCode = myProfile?.id || user.id

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, creci, whatsapp_number, created_at')
        .eq('status', 'pending_validation')
        .eq('referral_code', refCode)

      if (data) setPendingUsers(data)
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
        title: 'Erro',
        description: 'Não foi possível validar o membro.',
        variant: 'destructive',
      })
      return
    }

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('reputation_score')
      .eq('id', user.id)
      .single()
    if (myProfile) {
      await supabase
        .from('profiles')
        .update({
          reputation_score: (myProfile.reputation_score || 0) + 5,
        })
        .eq('id', user.id)
    }

    toast({
      title: 'Membro Validado',
      description: 'O membro agora tem acesso total e você ganhou +5 pontos de reputação!',
    })
    setPendingUsers((prev) => prev.filter((p) => p.id !== targetId))
  }

  if (loading || pendingUsers.length === 0) return null

  return (
    <Card className="bg-card border-primary/30 shadow-[0_0_30px_rgba(201,168,76,0.1)] mb-8 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" /> Curadoria da Rede (Membros Pendentes)
        </CardTitle>
        <CardDescription>
          Estes corretores usaram seu código de indicação. Como membro de Alta Reputação, você tem a
          autoridade para validar o acesso deles.
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
