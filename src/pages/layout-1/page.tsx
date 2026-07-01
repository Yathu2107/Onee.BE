import { Helmet } from 'react-helmet-async'
import { ArrowDownRight, ArrowUpRight, DollarSign, ShoppingCart, Users } from 'lucide-react'
import { Toolbar } from '@/components/layouts/layout-1/components/toolbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  {
    title: 'Total Users',
    value: '24,500',
    change: '+12.4%',
    trend: 'up' as const,
    icon: Users,
  },
  {
    title: 'Revenue',
    value: '$128,430',
    change: '+8.2%',
    trend: 'up' as const,
    icon: DollarSign,
  },
  {
    title: 'Orders',
    value: '1,842',
    change: '-2.1%',
    trend: 'down' as const,
    icon: ShoppingCart,
  },
]

const recentOrders = [
  { id: 'ORD-1024', customer: 'Sarah Johnson', amount: '$249.00', status: 'Completed' },
  { id: 'ORD-1023', customer: 'Michael Chen', amount: '$89.00', status: 'Pending' },
  { id: 'ORD-1022', customer: 'Emma Wilson', amount: '$512.00', status: 'Completed' },
  { id: 'ORD-1021', customer: 'James Miller', amount: '$129.00', status: 'Cancelled' },
]

export function Layout1Page() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Onee Admin</title>
      </Helmet>

      <Toolbar
        title="Dashboard"
        description="Welcome to your Metronic admin panel overview."
      />

      <div className="space-y-5 p-5">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight

            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardDescription>{stat.title}</CardDescription>
                    <CardTitle className="text-2xl">{stat.value}</CardTitle>
                  </div>
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-destructive'
                    }
                  >
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <TrendIcon className="size-4" />
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground ms-2 text-sm">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Monthly activity across your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 flex h-64 items-end gap-3 rounded-lg p-4">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="bg-primary w-full rounded-t-md transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-muted-foreground text-[10px]">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions from your store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-muted-foreground text-xs">{order.id}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-medium">{order.amount}</p>
                      <p className="text-muted-foreground text-xs">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
