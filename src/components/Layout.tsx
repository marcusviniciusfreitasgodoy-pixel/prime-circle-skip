import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground">
      <Outlet />
    </main>
  )
}
