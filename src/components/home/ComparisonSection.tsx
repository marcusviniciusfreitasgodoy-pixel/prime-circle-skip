import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, X } from 'lucide-react'

export function ComparisonSection() {
  const comparisons = [
    {
      feature: 'Liquidez de Inventário',
      traditional: 'Baixa (Local)',
      prime: 'Altíssima (Nacional)',
    },
    {
      feature: 'Suporte Jurídico/Operacional',
      traditional: 'Por conta própria',
      prime: 'Incluso 100%',
    },
    {
      feature: 'Modelo de Comissionamento (50/50)',
      traditional: 'Variável / Incerto',
      prime: 'Garantido via Contrato',
    },
    {
      feature: 'Tecnologia de Matchmaking',
      traditional: 'Inexistente',
      prime: 'Algoritmo Avançado',
    },
    { feature: 'Networking Qualificado', traditional: 'Eventual', prime: 'Comunidade Curada' },
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            A Diferença é <span className="text-primary">Clara</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Compare o modelo tradicional com o ecossistema fechado do Prime Circle.
          </p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-card/50 overflow-hidden shadow-[0_0_40px_rgba(201,168,76,0.05)] backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="hover:bg-transparent border-primary/20">
                <TableHead className="w-1/3 py-6 text-lg font-semibold text-foreground">
                  Recursos
                </TableHead>
                <TableHead className="w-1/3 py-6 text-lg font-semibold text-muted-foreground text-center">
                  Mercado Tradicional
                </TableHead>
                <TableHead className="w-1/3 py-6 text-lg font-bold text-primary text-center">
                  Prime Circle
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisons.map((row, index) => (
                <TableRow
                  key={index}
                  className="border-primary/10 hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="py-5 font-medium text-base">{row.feature}</TableCell>
                  <TableCell className="py-5 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <X className="w-4 h-4 text-destructive" />
                      <span>{row.traditional}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-center text-foreground font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>{row.prime}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
