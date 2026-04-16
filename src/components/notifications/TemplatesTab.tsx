import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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

  const isPredefined = (name: string) => {
    return [
      'Notificação de Match - WhatsApp',
      'Notificação de Match - Email',
      'Solicitação de Parceria - WhatsApp',
      'Solicitação de Parceria - Email',
      'Boas-vindas - WhatsApp',
      'Boas-vindas - Email',
      'Nova Demanda - WhatsApp',
      'Duo de Ouro - Falta Demanda',
      'Duo de Ouro - Falta Oferta',
      'Busca Inteligente - Sem Resultados',
    ].includes(name)
  }

  const getAvailableVariables = () => {
    const name = editingTemplate?.name || ''
    if (name.includes('Boas-vindas') || name.includes('Duo de Ouro')) {
      return ['{{full_name}}']
    }
    if (name.includes('Busca Inteligente')) {
      return ['{{full_name}}', '{{demand_details}}', '{{user_id}}']
    }
    if (name.includes('Match')) {
      return ['{{partner_name}}', '{{property_details}}']
    }
    if (name.includes('Demanda')) {
      return ['{{partner_name}}', '{{demand_details}}']
    }
    return [
      '{{partner_name}}',
      '{{property_details}}',
      '{{full_name}}',
      '{{demand_details}}',
      '{{user_id}}',
    ]
  }

  const insertVariable = (variable: string) => {
    setEditingTemplate((prev) => ({
      ...prev,
      content: prev?.content ? prev.content + ' ' + variable : variable,
    }))
  }

  if (isLoading)
    return <div className="text-muted-foreground py-8 text-center">Carregando templates...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Templates de Mensagem Dinâmicos</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Personalize os textos enviados para seus parceiros. Use as variáveis para inserir dados
            dinamicamente.
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
                <span className="line-clamp-1">{tpl.name}</span>
              </CardTitle>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-white"
                  onClick={() => handleOpenModal(tpl)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                {!isPredefined(tpl.name) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => handleDelete(tpl.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
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
        <DialogContent className="bg-card border-border sm:max-w-[600px]">
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
                className="bg-background text-white"
                placeholder="Ex: Confirmação de Match (WhatsApp)"
                disabled={isPredefined(editingTemplate?.name || '')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Canal</label>
              <Select
                value={editingTemplate?.channel}
                onValueChange={(val: 'whatsapp' | 'email') =>
                  setEditingTemplate((prev) => ({ ...prev, channel: val }))
                }
                disabled={isPredefined(editingTemplate?.name || '')}
              >
                <SelectTrigger className="bg-background text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-white">Conteúdo da Mensagem</label>
                <div className="flex gap-1 flex-wrap justify-end">
                  {getAvailableVariables().map((v) => (
                    <Badge
                      key={v}
                      variant="outline"
                      className="cursor-pointer border-primary/30 text-primary hover:bg-primary hover:text-black text-[10px] h-5 px-1.5 transition-colors"
                      onClick={() => insertVariable(v)}
                    >
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
              <Textarea
                value={editingTemplate?.content || ''}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({ ...prev, content: e.target.value }))
                }
                className="bg-background text-white min-h-[200px]"
                placeholder={`Olá {{partner_name}}, tenho interesse na sua demanda: {{property_details}}...`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dica: Clique nas variáveis (botões amarelos acima) para inseri-las rapidamente no
                final do seu texto. Elas serão substituídas por dados reais no momento do envio.
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
