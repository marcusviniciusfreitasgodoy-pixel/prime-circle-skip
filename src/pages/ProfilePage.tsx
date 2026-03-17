import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AmbassadorWidget } from '@/components/AmbassadorWidget'
import useAppStore from '@/stores/main'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { user } = useAppStore()
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  const [whatsapp, setWhatsapp] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (authUser) {
      supabase
        .from('profiles')
        .select('whatsapp_number')
        .eq('id', authUser.id)
        .single()
        .then(({ data }) => {
          if (data && data.whatsapp_number) {
            setWhatsapp(data.whatsapp_number)
          }
        })
    }
  }, [authUser])

  const handleSaveWhatsapp = async () => {
    if (!authUser) {
      toast({
        title: 'Não autenticado',
        description: 'Você precisa estar logado para salvar.',
        variant: 'destructive',
      })
      return
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(whatsapp)) {
      toast({
        title: 'Número inválido',
        description: 'Por favor, insira um número válido (ex: +5511999999999)',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authUser.id)
      .single()

    let err
    if (existingProfile) {
      const { error } = await supabase
        .from('profiles')
        .update({
          whatsapp_number: whatsapp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id)
      err = error
    } else {
      const { error } = await supabase.from('profiles').insert({
        id: authUser.id,
        whatsapp_number: whatsapp,
        updated_at: new Date().toISOString(),
      })
      err = error
    }

    setIsSaving(false)

    if (err) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Número de WhatsApp atualizado com sucesso.',
      })
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Meu Perfil</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie sua presença e acompanhe suas recompensas no Prime Circle.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card border-border text-center pt-8">
            <CardContent className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4 ring-2 ring-primary ring-offset-4 ring-offset-background">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-sm text-primary mb-6">Corretor {user.tier}</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <AmbassadorWidget tier={user.tier} />

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Informações Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">CRECI</p>
                  <p className="font-medium text-white">12345-RJ</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Região Principal</p>
                  <p className="font-medium text-white">Barra da Tijuca</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="font-medium text-white">R$ 4.500.000</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membro desde</p>
                  <p className="font-medium text-white">Março 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Contato WhatsApp</CardTitle>
              <CardDescription>
                Adicione seu número para receber notificações de matches e parcerias via Evolution
                API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-white">
                  Número do WhatsApp (com código do país)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="whatsapp"
                    placeholder="+5521999999999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="bg-background text-white"
                  />
                  <Button onClick={handleSaveWhatsapp} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
