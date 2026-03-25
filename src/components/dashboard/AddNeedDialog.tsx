import { useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle, X } from 'lucide-react'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'

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

  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [city, setCity] = useState('')
  const [stateLocation, setStateLocation] = useState('')

  const [condominiums, setCondominiums] = useState<string[]>([])
  const [condoInput, setCondoInput] = useState('')

  const addCondo = () => {
    const trimmed = condoInput.trim()
    if (trimmed && !condominiums.includes(trimmed)) {
      setCondominiums([...condominiums, trimmed])
    }
    setCondoInput('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    const md = {
      type: 'demanda',
      user_id: user.id,
      valor: parseCurrency(valor),
      tipo_imovel: String(fd.get('tipo_imovel') || ''),
      endereco: endereco,
      bairro: bairro,
      street: endereco,
      neighborhood: bairro,
      city: city,
      state: stateLocation,
      quartos: String(fd.get('quartos') || ''),
      suites: String(fd.get('suites') || ''),
      banheiros: String(fd.get('banheiros') || ''),
      vagas: String(fd.get('vagas') || ''),
      tamanho_imovel: Number(fd.get('tamanho_imovel') || 0),
      tamanho_terreno: fd.get('tamanho_terreno') ? Number(fd.get('tamanho_terreno')) : null,
      condominiums: condominiums,
      link_imovel: fd.get('link_imovel') ? String(fd.get('link_imovel')) : null,
      description: String(fd.get('description') || ''),
    }

    const condosText = condominiums.length > 0 ? `\nCondomínios: ${condominiums.join(', ')}` : ''
    const content = `Busca: ${md.tipo_imovel}\nBairro: ${md.neighborhood}\nEndereço: ${md.street}${condosText}\nCidade: ${md.city}\nEstado: ${md.state}\nValor Max: R$ ${md.valor}\nQuartos: ${md.quartos}\nSuítes: ${md.suites}\nBanheiros: ${md.banheiros}\nVagas: ${md.vagas}\nDetalhes: ${md.description}`

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
      setEndereco('')
      setBairro('')
      setCity('')
      setStateLocation('')
      setValor('')
      setCondominiums([])
      setCondoInput('')
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
          </div>

          <div className="space-y-2">
            <Label>Logradouro / Rua Preferencial (Opcional)</Label>
            <AddressAutocomplete
              name="endereco"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label>Bairros de Interesse</Label>
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
                placeholder="Ex: Barra da Tijuca ou Recreio"
              />
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
                  {['0', '1', '2', '3', '4', '5 ou mais'].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Banheiros (Mín)</Label>
              <Select name="banheiros" required defaultValue="1">
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
              <Label>Vagas (Mín)</Label>
              <Select name="vagas" required defaultValue="1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['0', '1', '2', '3', '4', '5 ou mais'].map((o) => (
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
              <Input name="tamanho_imovel" type="number" required placeholder="120" />
            </div>
            <div className="space-y-2">
              <Label>Terreno Mínimo (m²) (Opcional)</Label>
              <Input name="tamanho_terreno" type="number" placeholder="200" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condomínios Específicos (Opcional)</Label>
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
                  placeholder="Ex: Condomínio Rio Mar"
                />
                <Button type="button" onClick={addCondo} variant="secondary">
                  Adicionar
                </Button>
              </div>
              {condominiums.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {condominiums.map((c) => (
                    <Badge
                      key={c}
                      variant="secondary"
                      className="flex items-center gap-1 bg-secondary/50"
                    >
                      {c}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => setCondominiums((prev) => prev.filter((x) => x !== c))}
                      />
                    </Badge>
                  ))}
                </div>
              )}
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
