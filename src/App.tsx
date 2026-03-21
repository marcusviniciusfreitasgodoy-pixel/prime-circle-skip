import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import ApplyPage from './pages/ApplyPage'
import WaitlistPage from './pages/WaitlistPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import AuthConfirmPage from './pages/AuthConfirmPage'
import WelcomePage from './pages/WelcomePage'
import OnboardingPage from './pages/OnboardingPage'
import PendingPage from './pages/PendingPage'
import MatchClosePage from './pages/MatchClosePage'
import MatchFeedbackPage from './pages/MatchFeedbackPage'
import SuggestionsPage from './pages/SuggestionsPage'
import RoadmapPage from './pages/RoadmapPage'
import PublicSuggestionsPage from './pages/PublicSuggestionsPage'
import PlansPage from './pages/PlansPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import NotFound from './pages/NotFound'
import QuickUpdatePage from './pages/QuickUpdatePage'
import BrandAssetsPage from './pages/BrandAssetsPage'
import NeedsListPage from './pages/NeedsListPage'
import ListingsListPage from './pages/ListingsListPage'
import MatchesListPage from './pages/MatchesListPage'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import { PwaUpdater } from '@/components/PwaUpdater'
import { AppLayout } from '@/components/AppLayout'
import { GlobalPlanLimitBanner } from '@/components/GlobalPlanLimitBanner'
import { AppProvider } from '@/stores/main'
import { AuthProvider } from '@/hooks/use-auth'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Router>
            <AnalyticsTracker />
            <PwaUpdater />
            <GlobalPlanLimitBanner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/apply" element={<ApplyPage />} />
              <Route path="/apply/lista-de-espera" element={<WaitlistPage />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/confirm" element={<AuthConfirmPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/termos-de-uso" element={<TermsPage />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
              <Route path="/sugestoes" element={<PublicSuggestionsPage />} />
              <Route path="/quick-update" element={<QuickUpdatePage />} />
              <Route path="/brand" element={<BrandAssetsPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/pending" element={<PendingPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/match-feedback" element={<MatchFeedbackPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/plans" element={<PlansPage />} />
                  <Route path="/needs" element={<NeedsListPage />} />
                  <Route path="/listings" element={<ListingsListPage />} />
                  <Route path="/matches" element={<MatchesListPage />} />
                  <Route path="/suggestions" element={<SuggestionsPage />} />
                  <Route path="/roadmap" element={<RoadmapPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/matches/:id/close" element={<MatchClosePage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
