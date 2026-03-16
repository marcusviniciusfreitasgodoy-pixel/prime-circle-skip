import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import Apply from './pages/Apply'
import WaitlistPage from './pages/WaitlistPage'
import DashboardPage from './pages/DashboardPage'
import NotFound from './pages/NotFound'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Navbar } from '@/components/layout/Navbar'
import useAppStore, { AppProvider } from '@/stores/main'

function DashboardLayout() {
  const { user } = useAppStore()

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-24">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </AppProvider>
  )
}

export default App
