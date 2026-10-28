import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { OrderBadges, OrderSummary, OrderTimeline, orderDateFormat } from '@/features/orders/OrderCard'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States'
import { listMyOrders } from '@/services/ordersRepo'

export default function MyOrdersPage() {
  const { user } = useAuth()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['orders', 'mine', user?.uid], queryFn: () => listMyOrders(user!.uid), enabled: Boolean(user) })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Mis pedidos</h1>
      <div className="mt-6 space-y-4">
        {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={() => void refetch()} />
          : !data?.length ? <EmptyState title="Aún no tienes pedidos" />
          : data.map((o) => (
            <details key={o.id} className="group rounded-card border border-line p-5" open={data.length === 1}>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 marker:content-['']">
                <div><p className="font-semibold">{o.ref}</p><p className="text-xs text-muted">{orderDateFormat.format(o.createdAt)}</p></div>
                <OrderBadges order={o} />
              </summary>
              <div className="mt-4 grid gap-6 md:grid-cols-2"><OrderSummary order={o} /><OrderTimeline order={o} /></div>
            </details>
          ))}
      </div>
    </div>
  )
}
