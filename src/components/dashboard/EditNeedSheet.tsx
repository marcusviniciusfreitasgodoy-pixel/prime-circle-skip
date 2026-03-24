import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Save, X } from 'lucide-react'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'

const formatCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseInt(digits, 10) / 100,
  )
}

const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100

export function EditNeedSheet({
  need,
  open,
  onOpenChange,
  onSuccess,
}: {
  need: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [valor, setValor] = useState('')

  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [city, setCity] = useState('')
  const [stateLocation, setStateLocation] = useState('')

  const [condominiums, setCondominiums] = useState<string[]>([])
  const [condoInput, setCondoInput] = useState('')

  useEffect(() => {
    if (need && open) {
      const md = need.metadata || {}
      setValor(
        md.valor
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(md.valor)
          : md.budget || '',
      )
      setEndereco(md.endereco || md.street || md.region || '')
      setBairro(md.bairro || md.neighborhood || md.region || '')
      setCity(md.city || '')
      setStateLocation(md.state || '')
      setCondominiums(md.condominiums || [])
    }
  }, [need, open])

  const addCondo = () => {
    const trimmed = condoInput.trim()
    if (trimmed && !condominiums.includes(trimmed)) {
      setCondominiums([...condominiums, trimmed])
    }
    setCondoInput('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !need) return
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    const parsedVal = valor.includes('R$')
      ? parseCurrency(valor)
      : need.metadata.valor || parseCurrency(valor)

    const md = {
      ...need.metadata,
      valor: parsedVal,
      tipo_imovel: String(fd.get('tipo_imovel') || need.metadata.tipo_imovel || ''),
      endereco: endereco,
      bairro: bairro,
      street: endereco,
      neighborhood: bairro,
      city: city,
      state: stateLocation,
      quartos: String(fd.get('quartos') || need.metadata.quartos || ''),
      suites: String(fd.get('suites') || need.metadata.suites || ''),
      tamanho_imovel: Number(fd.get('tamanho_imovel') || need.metadata.tamanho_imovel || 0),
      tamanho_terreno: fd.get('tamanho_terreno')
        ? Number(fd.get('tamanho_terreno'))
        : need.metadata.tamanho_terreno,
      condominiums: condominiums,
      link_imovel: fd.get('link_imovel')
        ? String(fd.get('link_imovel'))
        : need.metadata.link_imovel,
      description: String(fd.get('description') || need.metadata.description || ''),
    }

    if (valor.includes('R$')) {
      md.budget = valor
    }

    const condosText = condominiums.length > 0 ? `\nCondomínios: ${condominiums.join(', ')}` : ''
    const content = `Busca: ${md.tipo_imovel}\nBairro: ${md.neighborhood}\nEndereço: ${md.street}${condosText}\nCidade: ${md.city}\nEstado: ${md.state}\nValor Max: R$ ${md.valor}\nQuartos: ${md.quartos}\nDetalhes: ${md.description}`

    const { error } = await supabase
      .from('documents')
      .update({ content, metadata: md })
      .eq('id', need.id)

    setLoading(false)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar demanda.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Demanda atualizada!',
        className: 'bg-card border-primary/50 text-white',
      })
      onOpenChange(false)
      onSuccess()
    }
  }

  if (!need) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Demanda</SheetTitle>
          <SheetDescription>Atualize os detalhes da necessidade do seu cliente.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Tipo de Imóvel</Label>
            <Select
              name="tipo_imovel"
              required
              defaultValue={need.metadata?.tipo_imovel || 'Apartamento'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Apartamento', 'Cobertura', 'Casa', 'Terreno', 'Sala Comercial', 'Flat'].map(
                  (o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ),
                )}
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
          <div className="space-y-2">
            <Label>Logradouro / Rua Preferencial</Label>
            <AddressAutocomplete
              name="endereco"
              required
              value={endereco}
              onChange={setEndereco}
              onSelect={(details) => {
                setEndereco(details.street || details.formattedAddress)
                if (details.neighborhood) setBairro(details.neighborhood)
                if (details.city) setCity(details.city)
                if (details.state) setStateLocation(details.state)
              }}
              placeholder="Ex: Av. Lúcio Costa"
            />
          </div>

          <div className="space-y-2">
            <Label>Cidade</Label>
            <AddressAutocomplete
              name="cidade"
              required
              types={['(cities)']}
              value={city}
              onChange={setCity}
              onSelect={(details) => {
                setCity(details.city || details.formattedAddress.split(',')[0])
                if (details.state) setStateLocation(details.state)
              }}
              placeholder="Ex: Rio de Janeiro"
            />
          </div>

          <div className="space-y-2">
            <Label>Bairro / Vizinhança</Label>
            <AddressAutocomplete
              name="bairro"
              required
              types={['(regions)']}
              value={bairro}
              onChange={setBairro}
              onSelect={(details) => {
                setBairro(details.neighborhood || details.street || details.formattedAddress)
                if (details.city) setCity(details.city)
                if (details.state) setStateLocation(details.state)
              }}
              placeholder="Ex: Barra da Tijuca"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quartos (Mín)</Label>
              <Select name="quartos" required defaultValue={need.metadata?.quartos || '1'}>
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
              <Select name="suites" required defaultValue={need.metadata?.suites || '1'}>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Área Mínima (m²)</Label>
              <Input
                name="tamanho_imovel"
                type="number"
                required
                defaultValue={need.metadata?.tamanho_imovel || ''}
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label>Terreno Mínimo (m²)</Label>
              <Input
                name="tamanho_terreno"
                type="number"
                defaultValue={need.metadata?.tamanho_terreno || ''}
                placeholder="200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Condomínios Específicos</Label>
            <div className="flex gap-2">
              <Input
                value={condoInput}
                onChange={(e) => setCondoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCondo()
                  }
                }}
                placeholder="Adicione um condomínio..."
              />
              <Button type="button" onClick={addCondo} variant="secondary">
                Adicionar
              </Button>
            </div>
            {condominiums.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-secondary/30 rounded-md border border-border">
                {condominiums.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-background border border-border"
                  >
                    {c}
                    <button
                      type="button"
                      className="hover:bg-destructive/20 hover:text-destructive rounded-full p-0.5 transition-colors"
                      onClick={() => setCondominiums((prev) => prev.filter((x) => x !== c))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Link de Referência (Opcional)</Label>
            <Input
              name="link_imovel"
              defaultValue={need.metadata?.link_imovel || ''}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição Detalhada</Label>
            <Textarea
              name="description"
              required
              defaultValue={need.metadata?.description || ''}
              placeholder="Preferências adicionais..."
              className="h-24"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
