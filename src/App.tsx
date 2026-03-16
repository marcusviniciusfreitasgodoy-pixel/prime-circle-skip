import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/stores/main'
import Layout from './components/Layout'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AnalyticsTracker } from './components/AnalyticsTracker'
import NotFound from './pages/NotFound'

import Index from './pages/Index'
import ApplyPage from './pages/ApplyPage'
import WaitlistPage from './pages/WaitlistPage'
import AuthConfirmPage from './pages/AuthConfirmPage'
import OnboardingPage from './pages/OnboardingPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import PendingPage from './pages/PendingPage'
import DashboardPage from './pages/DashboardPage'
import ListingsListPage from './pages/ListingsListPage'
import NeedsListPage from './pages/NeedsListPage'
import MatchesListPage from './pages/MatchesListPage'
import SuggestionsPage from './pages/SuggestionsPage'
import PlansPage from './pages/PlansPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import MatchClosePage from './pages/MatchClosePage'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <AnalyticsTracker />
      <TooltipProvider>
        <Toaster />
        <Sonner theme="dark" position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/apply/lista-de-espera" element={<WaitlistPage />} />
            <Route path="/auth/confirm" element={<AuthConfirmPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Layout />}>
              <Route index element={<OnboardingPage />} />
            </Route>

            <Route path="/pending" element={<Layout />}>
              <Route index element={<PendingPage />} />
            </Route>

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/listings" element={<ListingsListPage />} />
              <Route path="/needs" element={<NeedsListPage />} />
              <Route path="/matches" element={<MatchesListPage />} />
              <Route path="/matches/:id/close" element={<MatchClosePage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
