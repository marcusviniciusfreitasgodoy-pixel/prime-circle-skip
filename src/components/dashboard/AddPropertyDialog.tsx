import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle, Lock } from 'lucide-react'

const formatCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseInt(digits, 10) / 100,
  )
}
const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100

export function AddPropertyDialog({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOffMarket, setIsOffMarket] = useState(false)
  const [valor, setValor] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const md = {
      type: 'oferta',
      user_id: user.id,
      is_off_market: isOffMarket,
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
      status: 'Ativo',
      photos: [],
    }

    const content = `Tipo: ${md.tipo_imovel}\nBairro: ${md.bairro}\nEndereço: ${md.endereco}\nValor: R$ ${md.valor}\nQuartos: ${md.quartos}\nSuítes: ${md.suites}\nDetalhes: ${md.description}`

    const { error } = await supabase.from('documents').insert({ content, metadata: md })

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao divulgar imóvel.', variant: 'destructive' })
    } else {
      toast({
        title: 'Sucesso',
        description: isOffMarket ? 'Imóvel Reservado.' : 'Imóvel publicado!',
        className: 'bg-card border-primary/50 text-white',
      })
      setOpen(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gold-gradient text-black font-semibold shadow-[0_0_15px_rgba(201,168,76,0.2)]">
          <PlusCircle className="w-4 h-4 mr-2" /> Divulgar Imóvel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Divulgar Novo Imóvel</DialogTitle>
          <DialogDescription>
            Insira os dados do imóvel. Imóveis Reservados só serão vistos por corretores Elite.
          </DialogDescription>
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
              <Label>Valor</Label>
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
              <Label>Rua/Avenida</Label>
              <Input name="endereco" required placeholder="Ex: Av. das Américas" />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input name="bairro" required placeholder="Ex: Barra da Tijuca" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Quartos</Label>
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
              <Label>Suítes</Label>
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
              <Label>Área Útil (m²)</Label>
              <Input name="tamanho_imovel" type="number" required placeholder="120" />
            </div>
            <div className="space-y-2">
              <Label>Terreno (m²)</Label>
              <Input name="tamanho_terreno" type="number" required placeholder="200" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Condomínio (Opcional)</Label>
              <Input name="nome_condominio" placeholder="Ex: Condomínio Península" />
            </div>
            <div className="space-y-2">
              <Label>Link do Imóvel (Opcional)</Label>
              <Input name="link_imovel" placeholder="https://" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea name="description" required placeholder="Diferenciais..." className="h-20" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/30">
            <div>
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Exclusivo / Reservado
              </Label>
              <p className="text-xs text-muted-foreground">
                Restringir visibilidade para corretores de alta pontuação.
              </p>
            </div>
            <Switch checked={isOffMarket} onCheckedChange={setIsOffMarket} />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Salvando...' : 'Publicar Imóvel'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
