import {
  Bell,
  Briefcase,
  LayoutDashboard,
  Layers,
  MessageSquareWarning,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface MenuItem {
  title?: string
  path?: string
  icon?: LucideIcon
  heading?: string
  children?: MenuItem[]
}

export const MENU_SIDEBAR: MenuItem[] = [
  {
    heading: 'Dashboards',
  },
  {
    title: 'Default',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    heading: 'Management',
  },
  {
    title: 'User Management',
    path: '/users',
    icon: Users,
  },
  {
    heading: 'Operations',
  },
  {
    title: 'Jobs',
    path: '/jobs',
    icon: Briefcase,
  },
  {
    title: 'Notifications',
    path: '/notifications',
    icon: Bell,
  },
  {
    title: 'Complaints',
    path: '/complaints',
    icon: MessageSquareWarning,
  },
  {
    heading: 'Master Data',
  },
  {
    title: 'Worker Categories',
    path: '/master-data/worker-categories',
    icon: Layers,
  },
]
