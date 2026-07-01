import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { SettingsProvider } from '@/providers/settings-provider'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>{children}</SettingsProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
