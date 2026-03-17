import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Mail, MessageSquare } from 'lucide-react'
import {
  fetchTemplates,
  saveTemplate,
  deleteTemplate,
  NotificationTemplate,
} from '@/services/notifications'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function TemplatesTab() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Partial<NotificationTemplate> | null>(null)

  useEffect(() => {
    if (user) loadTemplates()
  }, [user])

  const loadTemplates = async () => {
    setIsLoading(true)
    const { data } = await fetchTemplates(user!.id)
    if (data) setTemplates(data)
    setIsLoading(false)
  }

  const handleOpenModal = (template?: NotificationTemplate) => {
    setEditingTemplate(template || { name: '', content: '', channel: 'whatsapp' })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!user || !editingTemplate?.name || !editingTemplate?.content || !editingTemplate?.channel) {
      toast.error('Preencha todos os campos.')
      return
    }

    const { error } = await saveTemplate(user.id, editingTemplate)
    if (error) {
      toast.error('Erro ao salvar template: ' + error.message)
    } else {
      toast.success('Template salvo com sucesso!')
      setIsModalOpen(false)
      loadTemplates()
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    const { error } = await deleteTemplate(id, user.id)
    if (error) {
      toast.error('Erro ao excluir.')
    } else {
      toast.success('Template excluído.')
      loadTemplates()
    }
  }

  if (isLoading)
    return <div className="text-muted-foreground py-8 text-center">Carregando templates...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Templates de Notificação</h3>
          <p className="text-muted-foreground text-sm">
            Gerencie as mensagens automáticas enviadas aos seus parceiros.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="gold-gradient text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl) => (
          <Card
            key={tpl.id}
            className="bg-secondary border-border hover:border-primary/50 transition-colors"
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                {tpl.channel === 'whatsapp' ? (
                  <MessageSquare className="w-4 h-4 text-green-500" />
                ) : (
                  <Mail className="w-4 h-4 text-blue-500" />
                )}
                {tpl.name}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-white"
                  onClick={() => handleOpenModal(tpl)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={() => handleDelete(tpl.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                {tpl.content}
              </p>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && (
          <div className="col-span-2 text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Nenhum template cadastrado.</p>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTemplate?.id ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Nome do Template</label>
              <Input
                value={editingTemplate?.name || ''}
                onChange={(e) => setEditingTemplate((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-background"
                placeholder="Ex: Confirmação de Match (WhatsApp)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Canal</label>
              <Select
                value={editingTemplate?.channel}
                onValueChange={(val: 'whatsapp' | 'email') =>
                  setEditingTemplate((prev) => ({ ...prev, channel: val }))
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Conteúdo da Mensagem</label>
              <Textarea
                value={editingTemplate?.content || ''}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({ ...prev, content: e.target.value }))
                }
                className="bg-background min-h-[150px]"
                placeholder={`Olá {{partner_name}}, tenho interesse na sua demanda: {{property_details}}...`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variáveis dinâmicas:{' '}
                <code className="bg-secondary text-primary px-1 rounded">{'{{partner_name}}'}</code>{' '}
                e{' '}
                <code className="bg-secondary text-primary px-1 rounded">
                  {'{{property_details}}'}
                </code>
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gold-gradient text-black font-semibold">
              Salvar Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
