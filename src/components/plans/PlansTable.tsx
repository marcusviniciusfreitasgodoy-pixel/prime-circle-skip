import { Check, X, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const compareFeatures = [
  {
    name: 'Demandas/mês',
    tooltip: 'Quantidade de pedidos de busca que você pode cadastrar mensalmente.',
    free: '3',
    pro: 'Ilimitado',
    founder: 'Ilimitado',
  },
  {
    name: 'Imóveis',
    tooltip: 'Número de propriedades exclusivas que você pode ofertar na rede.',
    free: '3',
    pro: 'Ilimitado',
    founder: 'Ilimitado',
  },
  {
    name: 'Conexões',
    tooltip: 'Quantidade de matches (conversas iniciadas) que você pode realizar.',
    free: '10',
    pro: 'Ilimitado',
    founder: 'Ilimitado',
  },
  {
    name: 'Suporte',
    tooltip: 'Tempo médio de resposta do nosso time de atendimento.',
    free: 'Comunitário',
    pro: 'Até 4h',
    founder: 'Até 2h',
  },
  {
    name: 'Desconto por matches',
    tooltip: 'Redução na mensalidade baseada no volume de negócios gerados.',
    free: false,
    pro: true,
    founder: true,
  },
  {
    name: 'Badge Founder',
    tooltip: 'Selo exclusivo de membro pioneiro e prioridade nos resultados.',
    free: false,
    pro: false,
    founder: true,
  },
  {
    name: 'Voto em produto',
    tooltip: 'Poder de decisão sobre o desenvolvimento de novas funcionalidades.',
    free: false,
    pro: true,
    founder: true,
  },
]

export function PlansTable() {
  return (
    <div className="mt-20 pt-8 border-t border-border/50">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold text-white mb-4">Comparativo Detalhado</h3>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Entenda todas as diferenças de forma aprofundada e escolha o ecossistema ideal para o seu
          momento atual de carreira.
        </p>
      </div>
      <TooltipProvider delayDuration={300}>
        <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-elevation max-w-5xl mx-auto">
          <Table>
            <TableHeader className="bg-secondary/80">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[250px] md:w-[350px] text-white font-semibold py-5 px-6 text-base">
                  Funcionalidade
                </TableHead>
                <TableHead className="text-center font-bold text-white py-5 text-base w-[150px]">
                  FREE
                </TableHead>
                <TableHead className="text-center font-bold text-primary py-5 bg-primary/5 text-base w-[150px]">
                  PROFESSIONAL
                </TableHead>
                <TableHead className="text-center font-bold text-white py-5 text-base w-[150px]">
                  FOUNDER
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compareFeatures.map((feat, i) => (
                <TableRow key={i} className="border-border hover:bg-secondary/40 transition-colors">
                  <TableCell className="font-medium text-white px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm md:text-base">{feat.name}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-white cursor-help transition-colors shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-[250px] bg-secondary border-border text-white p-3 shadow-lg rounded-lg"
                        >
                          <p className="text-sm leading-relaxed">{feat.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground py-5">
                    {typeof feat.free === 'boolean' ? (
                      feat.free ? (
                        <Check className="w-5 h-5 mx-auto text-primary" />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-muted-foreground/40" />
                      )
                    ) : (
                      <span className="font-semibold text-sm">{feat.free}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-white font-medium bg-primary/5 py-5">
                    {typeof feat.pro === 'boolean' ? (
                      feat.pro ? (
                        <Check className="w-5 h-5 mx-auto text-primary" />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-muted-foreground/40" />
                      )
                    ) : (
                      <span className="font-bold text-sm text-primary">{feat.pro}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground py-5">
                    {typeof feat.founder === 'boolean' ? (
                      feat.founder ? (
                        <Check className="w-5 h-5 mx-auto text-primary" />
                      ) : (
                        <X className="w-5 h-5 mx-auto text-muted-foreground/40" />
                      )
                    ) : (
                      <span className="font-semibold text-sm">{feat.founder}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
    </div>
  )
}
