import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoadingBar from 'react-top-loading-bar'
import { Layout1 } from '@/components/layouts/layout-1'
import { useProgress } from '@/hooks/use-progress'
import { PlaceholderPage } from '@/pages/shared/placeholder-page'

const Layout1Page = lazy(() =>
  import('@/pages/layout-1/page').then((module) => ({ default: module.Layout1Page })),
)
const LoginPage = lazy(() =>
  import('@/pages/auth/login-page').then((module) => ({ default: module.LoginPage })),
)

function AppRoutes() {
  const { progress } = useProgress()
  const location = useLocation()

  return (
    <>
      <LoadingBar color="#1b84ff" progress={progress} key={location.pathname} />
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />

        <Route element={<Layout1 />}>
          <Route index element={<Layout1Page />} />
          <Route
            path="analytics"
            element={
              <PlaceholderPage
                title="Analytics"
                description="Track metrics and performance insights."
              />
            }
          />
          <Route
            path="users"
            element={
              <PlaceholderPage title="Users" description="Manage user accounts and permissions." />
            }
          />
          <Route
            path="roles"
            element={
              <PlaceholderPage title="Roles" description="Configure roles and access control." />
            }
          />
          <Route
            path="settings"
            element={
              <PlaceholderPage
                title="Account Settings"
                description="Update your profile and preferences."
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export function AppRouting() {
  const baseUrl = import.meta.env.VITE_BASE_URL || '/'
  const basename =
    baseUrl.endsWith('/') && baseUrl !== '/' ? baseUrl.slice(0, -1) : baseUrl

  return (
    <BrowserRouter basename={basename}>
      <Suspense
        fallback={
          <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
            Loading...
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  )
}
