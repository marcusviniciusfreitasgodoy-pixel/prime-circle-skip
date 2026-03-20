import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function MatchesChartWidget() {
  const [data, setData] = useState<{ date: string; matches: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true)
      try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

        // Fetch real partnerships/matches from database
        const { data: partnerships, error } = await supabase
          .from('partnerships')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo)

        if (error) {
          console.error('Error fetching matches for chart:', error)
          setLoading(false)
          return
        }

        // Initialize last 30 days with 0
        const grouped: Record<string, number> = {}
        for (let i = 29; i >= 0; i--) {
          const dateStr = format(subDays(new Date(), i), 'dd/MM')
          grouped[dateStr] = 0
        }

        // Populate with real data
        if (partnerships && partnerships.length > 0) {
          partnerships.forEach((p) => {
            const dateStr = format(new Date(p.created_at), 'dd/MM')
            if (grouped[dateStr] !== undefined) {
              grouped[dateStr]++
            }
          })
        }

        const chartData = Object.entries(grouped).map(([date, matches]) => ({
          date,
          matches,
        }))

        setData(chartData)
      } catch (err) {
        console.error('Exception fetching chart data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const chartConfig = useMemo(
    () => ({
      matches: {
        label: 'Novas Conexões',
        color: 'hsl(var(--primary))',
      },
    }),
    [],
  )

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-white">Evolução de Conexões (30 dias)</CardTitle>
        <CardDescription>Volume de matches gerados na rede por dia</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] w-full animate-pulse bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
            <span className="text-muted-foreground text-sm">Carregando métricas...</span>
          </div>
        ) : data.every((d) => d.matches === 0) ? (
          <div className="h-[250px] w-full flex items-center justify-center bg-background/50 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground text-sm">
              Nenhuma conexão registrada neste período.
            </p>
          </div>
        ) : (
          <div className="h-[250px] w-full mt-2">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    dy={10}
                    minTickGap={15}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.5 }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="matches"
                    fill="var(--color-matches)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
