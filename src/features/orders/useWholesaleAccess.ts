import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { listMyOrders } from '@/services/ordersRepo'
import { DEMO_MODE } from '@/services/firebase'

/**
 * Regla de negocio: tras la primera compra ENTREGADA y PAGADA el cliente compra al precio mayorista.
 * En producción esto es un claim `wholesale` que asigna el servidor; en demo se deduce de los pedidos.
 */
export function useWholesaleAccess() {
  const { user, wholesale } = useAuth()
  const { data } = useQuery({
    queryKey: ['orders', 'mine', user?.uid],
    queryFn: () => listMyOrders(user!.uid),
    enabled: DEMO_MODE && Boolean(user),
  })
  const completed = (data ?? []).some((o) => o.status === 'delivered' && o.paymentStatus === 'paid')
  return { signedIn: Boolean(user), canBuy: wholesale || completed }
}
