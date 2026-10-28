import { ClipboardList, LogOut, Package, Store } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { BRAND } from '@/config/brand'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const { role, user, logout } = useAuth()
  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-2 px-3 py-1.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="hidden font-semibold sm:inline">{BRAND.name} <span className="text-muted">· Panel</span></span>
            <nav aria-label="Administración" className="flex gap-1">
              <NavLink to="/admin/productos" className={({ isActive }) => cn('flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm sm:gap-2 sm:px-3', isActive ? 'bg-brand-600/20 font-medium text-ink' : 'text-muted hover:bg-surface hover:text-ink')}>
                <Package className="size-4" aria-hidden />Productos
              </NavLink>
              <NavLink to="/admin/pedidos" className={({ isActive }) => cn('flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm sm:gap-2 sm:px-3', isActive ? 'bg-brand-600/20 font-medium text-ink' : 'text-muted hover:bg-surface hover:text-ink')}>
                <ClipboardList className="size-4" aria-hidden />Pedidos
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted sm:inline">{user?.email} · {role === 'admin' ? 'Administrador' : 'Vendedor'}</span>
            <Link to="/" aria-label="Ver tienda" className="grid size-10 place-items-center rounded-full hover:bg-surface"><Store className="size-4" aria-hidden /></Link>
            <Button variant="ghost" size="sm" onClick={() => void logout()}><LogOut className="size-4" aria-hidden />Salir</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:py-8"><Outlet /></main>
    </div>
  )
}
