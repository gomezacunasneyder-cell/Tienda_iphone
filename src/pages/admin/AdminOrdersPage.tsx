import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States'
import { useAuth } from '@/features/auth/AuthContext'
import { DELIVERY_LABEL, NEXT_STATUS, STATUS_LABEL } from '@/features/orders/helpers'
import { OrderBadges, OrderSummary, OrderTimeline, orderDateFormat } from '@/features/orders/OrderCard'
import { cn, formatCOP } from '@/lib/utils'
import { listAllOrders, setOrderPaid, updateOrderStatus } from '@/services/ordersRepo'
import type { Order, OrderStatus } from '@/types/domain'

const filters: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']

function OrderRow({ order, canEdit }: { order: Order; canEdit: boolean }) {
  const qc = useQueryClient()
  const [error, setError] = useState<string>()
  const refresh = () => qc.invalidateQueries({ queryKey: ['orders'] }).then(() => qc.invalidateQueries({ queryKey: ['products'] }))
  const status = useMutation({ mutationFn: (s: OrderStatus) => updateOrderStatus(order.id, s), onSuccess: refresh, onError: (e) => setError(e.message) })
  const pay = useMutation({ mutationFn: (paid: boolean) => setOrderPaid(order.id, paid), onSuccess: refresh, onError: (e) => setError(e.message) })

  return (
    <details className="rounded-2xl border border-line-strong/70 bg-card p-4 sm:p-5">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 marker:content-['']">
        <div>
          <p className="font-semibold tabular-nums">{order.ref} <span className="font-normal text-muted">·</span> {order.customerName}</p>
          <p className="text-xs text-muted">{orderDateFormat.format(order.createdAt)} · {DELIVERY_LABEL[order.deliveryMethod]} · {formatCOP(order.total)}</p>
        </div>
        <OrderBadges order={order} />
      </summary>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <OrderSummary order={order} />
          <p className="text-sm text-muted">Cliente: {order.customerEmail ?? '—'} · {order.phone} · id {order.customerId}</p>
        </div>
        <OrderTimeline order={order} />
      </div>
      {canEdit ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          {NEXT_STATUS[order.status].map((s) => (
            <Button key={s} size="sm" variant={s === 'cancelled' ? 'danger' : 'primary'} disabled={status.isPending} onClick={() => status.mutate(s)}>
              {s === 'cancelled' ? 'Cancelar pedido' : `Marcar: ${STATUS_LABEL[s]}`}
            </Button>
          ))}
          {order.status !== 'cancelled' ? (
            <Button size="sm" variant="outline" disabled={pay.isPending} onClick={() => pay.mutate(order.paymentStatus !== 'paid')}>
              {order.paymentStatus === 'paid' ? 'Marcar pago pendiente' : 'Confirmar pago recibido'}
            </Button>
          ) : null}
        </div>
      ) : <p className="mt-4 border-t border-line pt-3 text-xs text-muted">Tu rol solo permite ver el estado de los pedidos.</p>}
      {order.status === 'delivered' && order.paymentStatus === 'pending' ? <p className="mt-3 text-sm text-amber-300">Entregado con pago pendiente: revisa el cobro.</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-red-400">{error}</p> : null}
    </details>
  )
}

export default function AdminOrdersPage() {
  const { role } = useAuth()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['orders', 'all'], queryFn: listAllOrders })
  const list = (data ?? []).filter((o) => filter === 'all' || o.status === filter)

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por estado">
        {filters.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
            className={cn('chip', filter === f ? 'border-brand-600 bg-brand-600 font-medium text-white' : 'border-line-strong bg-card hover:bg-surface')}>
            {f === 'all' ? 'Todos' : STATUS_LABEL[f]}{data ? ` (${f === 'all' ? data.length : data.filter((o) => o.status === f).length})` : ''}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={() => void refetch()} />
          : list.length === 0 ? <EmptyState title="No hay pedidos en este estado" />
          : list.map((o) => <OrderRow key={o.id} order={o} canEdit={role === 'admin'} />)}
      </div>
    </>
  )
}
