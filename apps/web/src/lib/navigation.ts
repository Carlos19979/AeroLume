import { Home, Package, Ship, FileText, Palette, Key, BarChart3, Settings } from 'lucide-react';
import { LayoutDashboard, Building2, Users, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const DASHBOARD_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/products', label: 'Productos', icon: Package },
  { href: '/dashboard/boats', label: 'Barcos', icon: Ship },
  { href: '/dashboard/quotes', label: 'Presupuestos', icon: FileText },
  { href: '/dashboard/theme', label: 'Personalizar', icon: Palette },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Configuracion', icon: Settings },
];

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/tenants', label: 'Tenants', icon: Building2 },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/boats', label: 'Barcos', icon: Ship },
  { href: '/admin/logs', label: 'Actividad', icon: Activity },
];

// Extract page titles from nav items
export const PAGE_TITLES: Record<string, string> = Object.fromEntries(
  DASHBOARD_NAV.map(item => [item.href, item.label])
);
