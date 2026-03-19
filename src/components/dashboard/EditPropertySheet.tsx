import { useState, useEffect } from 'react'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { Lock } from 'lucide-react'

const formatCurrency = (value: string | number) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseInt(digits, 10) / 100,
  )
}
const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100

interface EditPropertySheetProps {
  property: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPropertySheet({
  property,
  open,
  onOpenChange,
  onSuccess,
}: EditPropertySheetProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isOffMarket, setIsOffMarket] = useState(false)
  const [valor, setValor] = useState('')

  useEffect(() => {
    if (property && open) {
      setIsOffMarket(!!property.metadata?.is_off_market)
      setValor(formatCurrency(property.metadata?.valor || 0))
    }
  }, [property, open])

  if (!property) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    const md = {
      ...property.metadata,
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
    }

    md.title = md.tipo_imovel
    md.price = formatCurrency(md.valor)
    md.location = md.bairro || md.endereco
    md.property_type = md.tipo_imovel

    const content = `Tipo: ${md.tipo_imovel}\nBairro: ${md.bairro}\nEndereço: ${md.endereco}\nValor: R$ ${md.valor}\nQuartos: ${md.quartos}\nSuítes: ${md.suites}\nDetalhes: ${md.description}`

    const { error } = await supabase
      .from('documents')
      .update({ content, metadata: md })
      .eq('id', property.id)
      .eq('metadata->>user_id', user.id)

    setLoading(false)
    if (error) {
      toast({
        title: 'Erro de Permissão',
        description: 'Falha ao atualizar imóvel. Apenas o proprietário pode realizar alterações.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Imóvel atualizado com sucesso!',
        className: 'bg-card border-primary/50 text-white',
      })
      onSuccess()
    }
  }

  const getSelectValue = (key: string, fallback: string) => {
    return property.metadata?.[key]?.toString() || fallback
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Editar Imóvel</SheetTitle>
          <SheetDescription>
            Atualize as informações da sua oportunidade de negócio.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Imóvel</Label>
              <Select
                name="tipo_imovel"
                required
                defaultValue={getSelectValue('tipo_imovel', 'Apartamento')}
              >
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
              <Input
                name="endereco"
                required
                defaultValue={property.metadata?.endereco || property.metadata?.location || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input
                name="bairro"
                required
                defaultValue={property.metadata?.bairro || property.metadata?.location || ''}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quartos</Label>
              <Select name="quartos" required defaultValue={getSelectValue('quartos', '1')}>
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
              <Select name="suites" required defaultValue={getSelectValue('suites', '1')}>
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
              <Input
                name="tamanho_imovel"
                type="number"
                required
                defaultValue={property.metadata?.tamanho_imovel || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Terreno (m²)</Label>
              <Input
                name="tamanho_terreno"
                type="number"
                required
                defaultValue={property.metadata?.tamanho_terreno || ''}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Condomínio (Opcional)</Label>
              <Input
                name="nome_condominio"
                defaultValue={property.metadata?.nome_condominio || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Link do Imóvel (Opcional)</Label>
              <Input name="link_imovel" defaultValue={property.metadata?.link_imovel || ''} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              name="description"
              required
              defaultValue={property.metadata?.description || property.content || ''}
              className="h-32"
            />
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
          <Button
            type="submit"
            className="w-full mt-4 gold-gradient text-black font-semibold shadow-md"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
