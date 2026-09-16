import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { LoginPage } from './auth/LoginPage'
import { ConfigMissingPage, PendingAccountPage, SetPasswordPage } from './auth/StatusScreens'
import { useAuth } from './auth/useAuth'
import { AdminLayout } from './layout/AdminLayout'
import { isSupabaseConfigured } from './lib/supabase'
import { DashboardPage } from './pages/DashboardPage'
import { FinancePage } from './pages/finance/FinancePage'
import { LeadsPage } from './pages/leads/LeadsPage'
import { PricesPage } from './pages/prices/PricesPage'
import { PatientPage } from './pages/patients/PatientPage'
import { PatientsPage } from './pages/patients/PatientsPage'
import { SchedulePage } from './pages/schedule/SchedulePage'
import { FullScreenSpinner } from './ui/primitives'
import { ToastProvider } from './ui/toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
})

export function RequireAdmin() {
  const { isAdmin } = useAuth()
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

function Gate() {
  const { ready, session, staff, staffLoading, recovery } = useAuth()

  if (!ready || staffLoading) return <FullScreenSpinner />
  if (recovery) return <SetPasswordPage />
  if (!session) return <LoginPage />
  if (!staff?.active) return <PendingAccountPage />

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientPage />} />
        <Route element={<RequireAdmin />}>
          <Route path="leads" element={<LeadsPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="prices" element={<PricesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.append(meta)
    document.title = 'PHOENIX CRM'
    return () => meta.remove()
  }, [])
}

export default function AdminApp() {
  useNoIndex()

  if (!isSupabaseConfigured) return <ConfigMissingPage />

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter basename="/admin">
            <Gate />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
