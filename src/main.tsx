import '@fontsource-variable/manrope'
import '@fontsource-variable/lora'
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n/I18nProvider'
import { initInstallPrompt } from './pwa/installStore'
import { watchForUpdates } from './pwa/updates'

// The CRM lives in its own chunk so the public site stays light.
const AdminApp = lazy(() => import('./admin/AdminApp'))
const isAdminRoute = /^\/admin(\/|$)/.test(location.pathname)

initInstallPrompt()
watchForUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <I18nProvider>
        <App />
      </I18nProvider>
    )}
  </StrictMode>,
)
