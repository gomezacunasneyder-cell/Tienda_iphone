import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui/States'
import { useAuth } from './AuthContext'

/** Para comprar hay que tener cuenta (no hay compra como invitado). Protección de UI; las reglas del servidor mandan. */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />
  return <Outlet />
}
