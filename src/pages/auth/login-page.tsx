import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-5">
      <Helmet>
        <title>Sign In | Onee Admin</title>
      </Helmet>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary mx-auto mb-4 flex size-12 items-center justify-center rounded-xl text-lg font-bold text-white">
            O
          </div>
          <CardTitle className="text-xl">Sign in to Onee Admin</CardTitle>
          <CardDescription>Metronic admin panel authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="demo@onee.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full" asChild>
            <Link to="/">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
