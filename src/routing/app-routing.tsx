import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoadingBar from 'react-top-loading-bar'
import { GuestOnly, RequireAuth } from '@/auth'
import { Layout1 } from '@/components/layouts/layout-1'
import { palette } from '@/config/colors'
import { useProgress } from '@/hooks/use-progress'
import { PlaceholderPage } from '@/pages/shared/placeholder-page'

const DashboardPage = lazy(() =>
  import('@/UI/dashboard/MainComponents/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)
const LoginPage = lazy(() =>
  import('@/UI/auth/MainComponents/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)

function AppRoutes() {
  const { progress } = useProgress()
  const location = useLocation()

  return (
    <>
      <LoadingBar color={palette.gold} progress={progress} key={location.pathname} />
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/auth/login" element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<Layout1 />}>
            <Route index element={<DashboardPage />} />
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
                <PlaceholderPage
                  title="Users"
                  description="Manage user accounts and permissions."
                />
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
