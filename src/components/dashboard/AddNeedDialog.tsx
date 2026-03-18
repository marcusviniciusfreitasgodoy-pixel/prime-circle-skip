import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle } from 'lucide-react'

const formatCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseInt(digits, 10) / 100,
  )
}
const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100

export function AddNeedDialog({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [valor, setValor] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const md = {
      type: 'demanda',
      user_id: user.id,
      valor: parseCurrency(valor),
      tipo_imovel: fd.get('tipo_imovel'),
      endereco: fd.get('endereco'),
      bairro: fd.get('bairro'),
      quartos: fd.get('quartos'),
      suites: fd.get('suites'),
      tamanho_imovel: Number(fd.get('tamanho_imovel')),
      tamanho_terreno: Number(fd.get('tamanho_terreno')),
      nome_condominio: fd.get('nome_condominio'),
      link_imovel: fd.get('link_imovel'),
      description: fd.get('description'),
    }

    const content = `Busca: ${md.tipo_imovel}\nBairro: ${md.bairro}\nEndereço: ${md.endereco}\nValor Max: R$ ${md.valor}\nQuartos: ${md.quartos}\nDetalhes: ${md.description}`

    const { error } = await supabase.from('documents').insert({ content, metadata: md })

    setLoading(false)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao publicar necessidade.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Demanda publicada!',
        className: 'bg-card border-primary/50 text-white',
      })
      setOpen(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_15px_rgba(201,168,76,0.1)] font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Postar Demanda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publicar Nova Necessidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Imóvel</Label>
              <Select name="tipo_imovel" required defaultValue="Apartamento">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Apartamento', 'Cobertura', 'Casa', 'Terreno', 'Sala Comercial'].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Orçamento Máximo</Label>
              <Input
                required
                placeholder="R$ 0,00"
                value={valor}
                onChange={(e) => setValor(formatCurrency(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Região / Rua Preferencial</Label>
              <Input name="endereco" required placeholder="Ex: Av. Faria Lima" />
            </div>
            <div className="space-y-2">
              <Label>Bairros de Interesse</Label>
              <Input name="bairro" required placeholder="Ex: Itaim Bibi" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Quartos (Mín)</Label>
              <Select name="quartos" required defaultValue="1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4', '5 ou mais'].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Suítes (Mín)</Label>
              <Select name="suites" required defaultValue="1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4', '5 ou mais'].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Área Mínima (m²)</Label>
              <Input name="tamanho_imovel" type="number" required placeholder="120" />
            </div>
            <div className="space-y-2">
              <Label>Terreno Mínimo (m²)</Label>
              <Input name="tamanho_terreno" type="number" required placeholder="200" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condomínio (Opcional)</Label>
              <Input name="nome_condominio" placeholder="Ex: Condomínio Jardim" />
            </div>
            <div className="space-y-2">
              <Label>Link de Referência (Opcional)</Label>
              <Input name="link_imovel" placeholder="https://" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição Detalhada</Label>
            <Textarea
              name="description"
              required
              placeholder="Preferências adicionais..."
              className="h-20"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar Demanda'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
