import { useState, useEffect, useRef } from 'react'
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
import { ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAppStore()
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [validatedBy, setValidatedBy] = useState<{ name: string; date: string } | null>(null)

  useEffect(() => {
    if (authUser) {
      supabase
        .from('profiles')
        .select('whatsapp_number, full_name, validated_by, validation_date, avatar_url')
        .eq('id', authUser.id)
        .single()
        .then(async ({ data }) => {
          if (data) {
            if (data.whatsapp_number) setWhatsapp(data.whatsapp_number)
            if (data.full_name) setFullName(data.full_name)
            if (data.avatar_url) setAvatarUrl(data.avatar_url)

            if (data.validated_by) {
              const { data: valData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', data.validated_by)
                .single()
              if (valData) {
                setValidatedBy({
                  name: valData.full_name || 'Membro Sênior',
                  date: data.validation_date || new Date().toISOString(),
                })
              }
            }
          }
        })
    }
  }, [authUser])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !authUser) return

    setIsSaving(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${authUser.id}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast({
        title: 'Erro no Upload',
        description: 'Não foi possível salvar a imagem de perfil.',
        variant: 'destructive',
      })
      setIsSaving(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const newAvatarUrl = publicUrlData.publicUrl

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', authUser.id)

    setIsSaving(false)

    if (updateError) {
      toast({
        title: 'Erro ao salvar perfil',
        description: updateError.message,
        variant: 'destructive',
      })
    } else {
      setAvatarUrl(newAvatarUrl)
      updateUser({ avatar: newAvatarUrl })
      toast({
        title: 'Sucesso',
        description: 'Foto de perfil atualizada.',
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!authUser) {
      toast({
        title: 'Não autenticado',
        description: 'Você precisa estar logado para salvar.',
        variant: 'destructive',
      })
      return
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (whatsapp && !phoneRegex.test(whatsapp)) {
      toast({
        title: 'Número inválido',
        description: 'Por favor, insira um número válido (ex: +5511999999999)',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    const { error } = await supabase.from('profiles').upsert({
      id: authUser.id,
      full_name: fullName,
      whatsapp_number: whatsapp,
      updated_at: new Date().toISOString(),
    })

    setIsSaving(false)

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso.',
      })
    }
  }

  if (!user) return null

  const displayInitial = (fullName || user.name || 'User').charAt(0).toUpperCase()
  const displayName = fullName || user.name

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
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-24 h-24 mb-4 ring-2 ring-primary ring-offset-4 ring-offset-background group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={avatarUrl || user.avatar} />
                  <AvatarFallback className="text-2xl">{displayInitial}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none pb-4">
                  <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded">
                    Trocar
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>
              <h3 className="text-xl font-bold text-white">{displayName}</h3>
              <p className="text-sm text-primary mb-4">Corretor {user.tier}</p>

              {validatedBy && (
                <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verificado por {validatedBy.name}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <AmbassadorWidget tier={user.tier} referrals={user.referrals} />

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
              <CardTitle className="text-lg text-white">Informações Pessoais e Contato</CardTitle>
              <CardDescription>
                Atualize seu nome e adicione seu número para receber notificações de conexões via
                Evolution API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Seu Nome Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-background text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-white">
                    Número do WhatsApp (com código do país)
                  </Label>
                  <Input
                    id="whatsapp"
                    placeholder="+5521999999999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="bg-background text-white"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
