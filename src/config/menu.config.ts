import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Shield,
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
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    heading: 'Management',
  },
  {
    title: 'Users',
    path: '/users',
    icon: Users,
  },
  {
    title: 'Roles',
    path: '/roles',
    icon: Shield,
  },
  {
    heading: 'Settings',
  },
  {
    title: 'Account',
    path: '/settings',
    icon: Settings,
  },
]
