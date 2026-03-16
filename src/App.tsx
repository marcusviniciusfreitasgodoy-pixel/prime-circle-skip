import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/stores/main'
import Layout from './components/Layout'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import NotFound from './pages/NotFound'

import Index from './pages/Index'
import ApplyPage from './pages/ApplyPage'
import PendingPage from './pages/PendingPage'
import DashboardPage from './pages/DashboardPage'
import ListingsListPage from './pages/ListingsListPage'
import NeedsListPage from './pages/NeedsListPage'
import MatchesListPage from './pages/MatchesListPage'
import SuggestionsPage from './pages/SuggestionsPage'
import PlansPage from './pages/PlansPage'
import AdminPage from './pages/AdminPage'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner theme="dark" position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/apply" element={<ApplyPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/pending" element={<Layout />}>
              <Route index element={<PendingPage />} />
            </Route>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/listings" element={<ListingsListPage />} />
              <Route path="/needs" element={<NeedsListPage />} />
              <Route path="/matches" element={<MatchesListPage />} />
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
