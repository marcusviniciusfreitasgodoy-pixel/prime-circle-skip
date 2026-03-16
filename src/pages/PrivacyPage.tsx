export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground">
        <h1 className="text-3xl font-bold text-white mb-8">Política de Privacidade</h1>
        <p>
          Suas informações de clientes, demandas e imóveis cadastrados como privados são protegidas
          e isoladas dentro do seu Chapter.
        </p>
        <p>
          O Prime Circle não vende leads. A infraestrutura atua apenas como facilitador de match
          entre parceiros verificados.
        </p>
        <a href="/" className="text-primary hover:underline mt-8 inline-block">
          Voltar
        </a>
      </div>
    </div>
  )
}
