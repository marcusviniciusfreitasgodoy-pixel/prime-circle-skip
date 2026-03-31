import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Check, X, Key, Search, Bot, MessageSquarePlus, BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { PartnerDetailsSheet } from './PartnerDetailsSheet'

interface Profile {
  id: string
  full_name?: string
  email?: string
  role: string
  plan: string
  status: string
  avatar_url?: string
  whatsapp_number?: string
  creci?: string
  region?: string
  specialties?: string
  bio?: string
  reputation_score?: number
  properties_count?: number
  demands_count?: number
  referrals_count?: number
  last_activation_reminder_at?: string
}

export function UsersManagementTab({
  profiles,
  refetchProfiles,
  authUser,
}: {
  profiles: Profile[]
  refetchProfiles: () => void
  authUser: any
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<
    'activate' | 'suspend' | 'reset_password' | 'force_activation' | null
  >(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isTriggeringActivation, setIsTriggeringActivation] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        p.full_name?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower)

      let matchesStatus = false
      if (statusFilter === 'all') matchesStatus = true
      else if (statusFilter === 'inactive')
        matchesStatus = p.properties_count === 0 && p.demands_count === 0
      else matchesStatus = p.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [profiles, searchQuery, statusFilter])

  const handleQuickActivate = async (e: React.MouseEvent, profile: Profile) => {
    e.stopPropagation()
    const toastId = toast.loading('Enviando notificação de ativação...')
    try {
      const { data, error } = await supabase.functions.invoke('process-activation-reminders', {
        body: { userIds: [profile.id] },
      })
      if (error) throw error

      toast.success('Ativação enviada com sucesso!', {
        id: toastId,
        description: 'A notificação foi enviada e registrada na Trilha de Auditoria.',
      })
      refetchProfiles()
    } catch (err: any) {
      toast.error('Erro ao enviar ativação', {
        id: toastId,
        description: err.message || 'Ocorreu um erro no servidor.',
      })
    }
  }

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const cleanUrl = url.startsWith('avatars/') ? url.replace('avatars/', '') : url
    return supabase.storage.from('avatars').getPublicUrl(cleanUrl).data.publicUrl
  }

  const handleTriggerActivation = async () => {
    if (isTriggeringActivation) return
    setIsTriggeringActivation(true)
    const toastId = toast.loading(
      'Analisando usuários e disparando notificações... Por favor, aguarde.',
    )

    try {
      const { data, error } = await supabase.functions.invoke('process-activation-reminders')
      if (error) throw error

      if (data?.processed === 0) {
        toast.info('Nenhum usuário elegível para notificação no momento.', {
          id: toastId,
          description: 'Todos os usuários inativos já foram notificados nos últimos 7 dias.',
        })
      } else {
        toast.success(`Ativação forçada concluída com sucesso!`, {
          id: toastId,
          description: `${data?.processed || 0} usuários processados. Enviados: ${data?.whatsappSent || 0} WhatsApps e ${data?.emailSent || 0} e-mails.`,
          duration: 8000,
        })
      }
      refetchProfiles()
    } catch (err: any) {
      toast.error(`Falha ao disparar automação`, {
        id: toastId,
        description: err.message || 'Ocorreu um erro no servidor.',
        duration: 8000,
      })
    } finally {
      setIsTriggeringActivation(false)
    }
  }

  const handleSelectAll = (checked: boolean) =>
    setSelectedUsers(checked ? filteredProfiles.map((p) => p.id) : [])
  const handleSelectUser = (id: string, checked: boolean) =>
    setSelectedUsers((prev) => (checked ? [...prev, id] : prev.filter((uid) => uid !== id)))

  const executeBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return
    setIsProcessing(true)

    try {
      if (bulkAction === 'activate') {
        const { error } = await supabase
          .from('profiles')
          .update({
            status: 'active',
            validated_by: authUser?.id,
            validation_date: new Date().toISOString(),
          })
          .in('id', selectedUsers)
        if (error) throw error
        toast.success(`${selectedUsers.length} usuários ativados com sucesso.`)
      } else if (bulkAction === 'suspend') {
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'rejected' })
          .in('id', selectedUsers)
        if (error) throw error
        toast.success(`${selectedUsers.length} usuários suspensos com sucesso.`)
      } else if (bulkAction === 'reset_password') {
        const usersToReset = profiles.filter((p) => selectedUsers.includes(p.id) && p.email)
        if (usersToReset.length === 0) {
          toast.error('Nenhum usuário com email válido selecionado.')
          setIsProcessing(false)
          setBulkAction(null)
          return
        }
        for (const u of usersToReset) {
          const { error } = await supabase.auth.resetPasswordForEmail(u.email!)
          if (error) console.error(`Error resetting password for ${u.email}:`, error)
        }
        toast.success(`E-mail de redefinição enviado para ${usersToReset.length} usuários.`)
      } else if (bulkAction === 'force_activation') {
        const { data, error } = await supabase.functions.invoke('process-activation-reminders', {
          body: { userIds: selectedUsers },
        })
        if (error) throw error
        toast.success(`Notificações de ativação enviadas com sucesso!`, {
          description: `${data?.processed || 0} usuários notificados (${data?.whatsappSent || 0} WA, ${data?.emailSent || 0} E-mail).`,
          duration: 8000,
        })
      }

      refetchProfiles()
      setSelectedUsers([])
    } catch (err) {
      toast.error('Erro ao executar ação em massa.')
    } finally {
      setIsProcessing(false)
      setBulkAction(null)
    }
  }

  const isAllSelected =
    filteredProfiles.length > 0 && selectedUsers.length === filteredProfiles.length

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3">
            <CardTitle className="text-lg text-white">Todos os Usuários</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 h-8 text-xs flex shrink-0 transition-all"
              onClick={handleTriggerActivation}
              disabled={isTriggeringActivation}
            >
              <Bot
                className={cn('w-3.5 h-3.5 mr-1.5', isTriggeringActivation && 'animate-pulse')}
              />
              {isTriggeringActivation ? 'Processando...' : 'Forçar Ativação'}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9 bg-background h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="pending_validation">Pendentes</SelectItem>
                <SelectItem value="inactive">Sem Cadastro</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {/* Mobile View */}
          <div className="block md:hidden space-y-3 px-4 pt-2 pb-4">
            {filteredProfiles.length > 0 && (
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                <Checkbox
                  id="select-all-mobile"
                  checked={isAllSelected}
                  onCheckedChange={(c) => handleSelectAll(c as boolean)}
                />
                <label htmlFor="select-all-mobile" className="text-sm font-medium text-white">
                  Selecionar todos
                </label>
              </div>
            )}

            {filteredProfiles.map((profile) => (
              <Card
                key={profile.id}
                className={cn(
                  'bg-secondary/50 border-border overflow-hidden transition-colors cursor-pointer',
                  selectedUsers.includes(profile.id) && 'border-primary/50 bg-primary/10',
                )}
                onClick={() => setSelectedProfile(profile)}
              >
                <CardContent className="p-4 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div onClick={(e) => e.stopPropagation()} className="mt-1">
                        <Checkbox
                          checked={selectedUsers.includes(profile.id)}
                          onCheckedChange={(c) => handleSelectUser(profile.id, c as boolean)}
                        />
                      </div>
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={getAvatarUrl(profile.avatar_url)} />
                        <AvatarFallback className="bg-secondary text-xs text-white">
                          {profile.full_name?.substring(0, 2).toUpperCase() || 'US'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white text-sm line-clamp-1">
                          {profile.full_name || 'Sem Nome'}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {profile.email || profile.whatsapp_number || 'Sem contato'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] border-border bg-background',
                          profile.status === 'active' &&
                            'bg-green-500/20 text-green-500 border-green-500/30',
                          profile.status === 'pending_validation' &&
                            'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
                          profile.status === 'rejected' &&
                            'bg-red-500/20 text-red-500 border-red-500/30',
                        )}
                      >
                        {profile.status === 'pending_validation'
                          ? 'Pendente'
                          : profile.status === 'active'
                            ? 'Ativo'
                            : 'Rejeitado'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-background/50 p-2 rounded-md border border-border/50">
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-sm font-bold text-white">
                        {profile.properties_count || 0}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase text-center leading-tight">
                        Imóveis
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1 border-x border-border/50">
                      <span className="text-sm font-bold text-white">
                        {profile.demands_count || 0}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase text-center leading-tight">
                        Demandas
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-sm font-bold text-primary">
                        {profile.referrals_count || 0}
                      </span>
                      <span className="text-[10px] text-primary/70 uppercase text-center leading-tight">
                        Parceiros
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {profile.last_activation_reminder_at ? (
                      <span
                        className="text-[10px] text-muted-foreground flex items-center gap-1"
                        title={`Último aviso: ${new Date(profile.last_activation_reminder_at).toLocaleDateString()}`}
                      >
                        <BellRing className="w-3 h-3 text-primary/70" /> Avisado
                      </span>
                    ) : (
                      <span />
                    )}

                    {profile.properties_count === 0 &&
                      profile.demands_count === 0 &&
                      profile.whatsapp_number && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 px-2 ml-auto"
                          onClick={(e) => handleQuickActivate(e, profile)}
                          title="Forçar Ativação"
                        >
                          <MessageSquarePlus className="w-4 h-4 mr-1.5" />
                          Ativar
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredProfiles.length === 0 && (
              <div className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-lg border border-border border-dashed">
                Nenhum usuário encontrado.
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block w-full px-0 sm:px-0">
            <Table className="min-w-[600px] w-full">
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(c) => handleSelectAll(c as boolean)}
                    />
                  </TableHead>
                  <TableHead className="w-[60px] hidden sm:table-cell">Avatar</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead className="hidden md:table-cell">Indicações</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow
                    key={profile.id}
                    className="border-border data-[state=selected]:bg-muted/50 hover:bg-secondary/30 transition-colors"
                    data-state={selectedUsers.includes(profile.id) ? 'selected' : undefined}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedUsers.includes(profile.id)}
                        onCheckedChange={(c) => handleSelectUser(profile.id, c as boolean)}
                      />
                    </TableCell>
                    <TableCell
                      className="cursor-pointer hidden sm:table-cell"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getAvatarUrl(profile.avatar_url)} />
                        <AvatarFallback className="bg-secondary text-xs">
                          {profile.full_name?.substring(0, 2).toUpperCase() || 'US'}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell
                      className="font-medium text-white cursor-pointer hover:underline min-w-[140px]"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div className="truncate max-w-[160px] sm:max-w-none">
                        {profile.full_name || 'Sem Nome'}
                      </div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5 no-underline hover:no-underline truncate max-w-[160px] sm:max-w-none">
                        {profile.email || profile.whatsapp_number || 'Sem contato'}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-background border-border"
                          >
                            {profile.properties_count || 0} Imóveis
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-background border-border"
                          >
                            {profile.demands_count || 0} Demandas
                          </Badge>
                        </div>
                        {profile.last_activation_reminder_at && (
                          <span
                            className="text-[10px] text-muted-foreground flex items-center gap-1"
                            title={`Último aviso: ${new Date(profile.last_activation_reminder_at).toLocaleDateString()}`}
                          >
                            <BellRing className="w-3 h-3 text-primary/70" /> Avisado
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-primary/10 text-primary border-primary/30"
                      >
                        {profile.referrals_count || 0} Parceiros
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          profile.status === 'active'
                            ? 'default'
                            : profile.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={cn(
                          'text-[10px]',
                          profile.status === 'active' && 'bg-green-500/20 text-green-500',
                          profile.status === 'pending_validation' &&
                            'bg-yellow-500/20 text-yellow-500',
                        )}
                      >
                        {profile.status === 'pending_validation'
                          ? 'Pendente'
                          : profile.status === 'active'
                            ? 'Ativo'
                            : 'Rejeitado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {profile.properties_count === 0 &&
                        profile.demands_count === 0 &&
                        profile.whatsapp_number && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 px-2"
                            onClick={(e) => handleQuickActivate(e, profile)}
                            title="Forçar Ativação"
                          >
                            <MessageSquarePlus className="w-4 h-4" />
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUsers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-[100] animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium text-popover-foreground whitespace-nowrap">
            {selectedUsers.length} selecionado(s)
          </span>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            size="sm"
            variant="ghost"
            className="text-green-500 hover:bg-green-500/10 hover:text-green-500"
            onClick={() => setBulkAction('activate')}
          >
            <Check className="w-4 h-4 mr-2" /> Ativar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => setBulkAction('suspend')}
          >
            <X className="w-4 h-4 mr-2" /> Suspender
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
            onClick={() => setBulkAction('force_activation')}
          >
            <BellRing className="w-4 h-4 mr-2" /> Notificar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-foreground hover:bg-foreground/10"
            onClick={() => setBulkAction('reset_password')}
          >
            <Key className="w-4 h-4 mr-2" /> Resetar Senha
          </Button>
        </div>
      )}

      <AlertDialog open={!!bulkAction} onOpenChange={(open) => !open && setBulkAction(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar ação em massa</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'activate' &&
                `Tem certeza que deseja ATIVAR ${selectedUsers.length} usuários? Eles receberão acesso à plataforma.`}
              {bulkAction === 'suspend' &&
                `Tem certeza que deseja SUSPENDER ${selectedUsers.length} usuários? Eles perderão o acesso à plataforma.`}
              {bulkAction === 'reset_password' &&
                `Tem certeza que deseja enviar o link de REDEFINIÇÃO DE SENHA para ${selectedUsers.length} usuários?`}
              {bulkAction === 'force_activation' &&
                `Tem certeza que deseja enviar um ALERTA DE ATIVAÇÃO (via WhatsApp e E-mail) para os ${selectedUsers.length} usuários selecionados?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-white hover:bg-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              disabled={isProcessing}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isProcessing ? 'Processando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PartnerDetailsSheet
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onStatusChange={(id, newStatus) => {
          refetchProfiles()
          if (selectedProfile?.id === id) {
            setSelectedProfile((prev) => (prev ? { ...prev, status: newStatus } : prev))
          }
        }}
      />
    </div>
  )
}
