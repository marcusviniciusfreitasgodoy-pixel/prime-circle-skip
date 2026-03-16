export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-background" />
            </div>
            <span className="text-lg font-bold tracking-widest">
              PRIME<span className="text-primary">CIRCLE</span>
            </span>
          </div>

          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Prime Circle. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
