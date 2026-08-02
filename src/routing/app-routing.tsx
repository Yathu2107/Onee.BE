import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoadingBar from 'react-top-loading-bar'
import { GuestOnly, RequireAuth } from '@/auth'
import { Layout1 } from '@/components/layouts/layout-1'
import { palette } from '@/config/colors'
import { useProgress } from '@/hooks/use-progress'

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
const UsersPage = lazy(() =>
  import('@/UI/users/MainComponents/UsersPage').then((module) => ({
    default: module.UsersPage,
  })),
)
const CategoriesPage = lazy(() =>
  import('@/UI/categories/MainComponents/CategoriesPage').then((module) => ({
    default: module.CategoriesPage,
  })),
)
const JobsPage = lazy(() =>
  import('@/UI/jobs/MainComponents/JobsPage').then((module) => ({
    default: module.JobsPage,
  })),
)
const NotificationsPage = lazy(() =>
  import('@/UI/notifications/MainComponents/NotificationsPage').then((module) => ({
    default: module.NotificationsPage,
  })),
)
const ComplaintsPage = lazy(() =>
  import('@/UI/complaints/MainComponents/ComplaintsPage').then((module) => ({
    default: module.ComplaintsPage,
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
            <Route path="users" element={<UsersPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notifications/:id" element={<NotificationsPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="complaints/:id" element={<ComplaintsPage />} />
            <Route path="master-data/worker-categories" element={<CategoriesPage />} />
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
