import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AmbassadorWidget } from '@/components/AmbassadorWidget'
import useAppStore from '@/stores/main'

export default function ProfilePage() {
  const { user } = useAppStore()

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
        </div>
      </div>
    </div>
  )
}
