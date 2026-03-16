export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground">
        <h1 className="text-3xl font-bold text-white mb-8">Termos de Serviço</h1>
        <p>
          Ao utilizar o Prime Circle, você concorda em praticar a divisão justa de honorários
          (50/50) em todas as transações geradas via plataforma.
        </p>
        <p>
          O não cumprimento das diretrizes éticas ou o bypass intencional da plataforma resultará em
          banimento permanente do círculo.
        </p>
        <a href="/" className="text-primary hover:underline mt-8 inline-block">
          Voltar
        </a>
      </div>
    </div>
  )
}
