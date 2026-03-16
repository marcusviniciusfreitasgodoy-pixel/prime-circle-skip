import { Building2, Users, PieChart } from 'lucide-react'

export function MetricsSection() {
  return (
    <section className="py-20 bg-background border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border/50 text-center">
          <div className="py-6 md:py-0 px-4">
            <div className="flex justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-bold mb-2 text-foreground">+R$ 2B</div>
            <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
              VGV sob Gestão
            </div>
          </div>
          <div className="py-6 md:py-0 px-4">
            <div className="flex justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-bold mb-2 text-foreground">500+</div>
            <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
              Corretores Elite
            </div>
          </div>
          <div className="py-6 md:py-0 px-4">
            <div className="flex justify-center mb-4">
              <PieChart className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-bold mb-2 text-foreground">85%</div>
            <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
              Taxa de Conversão
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
