import { Helmet } from 'react-helmet-async'
import { Toolbar } from '@/components/layouts/layout-1/components/toolbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <Helmet>
        <title>{title} | Onee Admin</title>
      </Helmet>

      <Toolbar title={title} description={description} />

      <div className="p-5">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              This page is ready for your {title.toLowerCase()} module content.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
