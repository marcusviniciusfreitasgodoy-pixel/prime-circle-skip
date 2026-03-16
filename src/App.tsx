import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import ApplyPage from './pages/ApplyPage'
import WaitlistPage from './pages/WaitlistPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import AuthConfirmPage from './pages/AuthConfirmPage'
import OnboardingPage from './pages/OnboardingPage'
import PendingPage from './pages/PendingPage'
import MatchClosePage from './pages/MatchClosePage'
import SuggestionsPage from './pages/SuggestionsPage'
import PlansPage from './pages/PlansPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import NotFound from './pages/NotFound'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import useAppStore, { AppProvider } from '@/stores/main'

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Router>
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/apply/lista-de-espera" element={<WaitlistPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/auth/confirm" element={<AuthConfirmPage />} />
            <Route path="/termos-de-uso" element={<TermsPage />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/pending" element={<PendingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/suggestions" element={<SuggestionsPage />} />
                <Route path="/matches/:id/close" element={<MatchClosePage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </AppProvider>
  )
}

export default App
