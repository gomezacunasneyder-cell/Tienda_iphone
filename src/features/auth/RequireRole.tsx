import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui/States'
import type { Role } from '@/types/domain'
import { useAuth } from './AuthContext'

/** Protección de UI solamente: la autorización real está en firestore.rules / storage.rules. */
export function RequireRole({ allow }: { allow: Role[] }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />
  return <Outlet />
}
