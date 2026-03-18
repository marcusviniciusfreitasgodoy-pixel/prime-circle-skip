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
import { Check, X, Key, Search } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  full_name?: string
  email?: string
  role: string
  plan: string
  status: string
  avatar_url?: string
  whatsapp_number?: string
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
  const [bulkAction, setBulkAction] = useState<'activate' | 'suspend' | 'reset_password' | null>(
    null,
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        p.full_name?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower)
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [profiles, searchQuery, statusFilter])

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
          <CardTitle className="text-lg text-white">Todos os Usuários</CardTitle>
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
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(c) => handleSelectAll(c as boolean)}
                  />
                </TableHead>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  className="border-border data-[state=selected]:bg-muted"
                  data-state={selectedUsers.includes(profile.id) ? 'selected' : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(profile.id)}
                      onCheckedChange={(c) => handleSelectUser(profile.id, c as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="bg-secondary text-xs">
                        {profile.full_name?.substring(0, 2).toUpperCase() || 'US'}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {profile.full_name || 'Sem Nome'}
                    <div className="text-xs text-muted-foreground font-normal mt-0.5">
                      {profile.email || profile.whatsapp_number || 'Sem contato'}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">{profile.role}</TableCell>
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
                </TableRow>
              ))}
              {filteredProfiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
    </div>
  )
}
