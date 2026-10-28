import { Badge } from '@/components/ui/Badge'
import { formatCOP } from '@/lib/utils'
import type { Order } from '@/types/domain'
import { DELIVERY_LABEL, PAYMENT_LABEL, STATUS_LABEL, STATUS_TONE } from './helpers'

const fmt = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="space-y-4 text-sm">
      <ul className="divide-y divide-line">
        {order.items.map((i) => (
          <li key={i.variantId} className="flex justify-between gap-4 py-2">
            <span>{i.qty} × {i.name}{i.variantLabel ? <span className="text-muted"> · {i.variantLabel}</span> : null}{i.priceTier === 'wholesale' ? <span className="text-amber-300"> · mayorista</span> : null}</span>
            <span className="shrink-0 font-medium">{formatCOP(i.unitPrice * i.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatCOP(order.subtotal)}</dd></div>
        {order.discount > 0 ? <div className="flex justify-between text-emerald-400"><dt>Descuento de fidelidad</dt><dd>−{formatCOP(order.discount)}</dd></div> : null}
        <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd>A convenir por WhatsApp</dd></div>
        <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatCOP(order.total)}</dd></div>
      </dl>
      <p className="text-muted">{DELIVERY_LABEL[order.deliveryMethod]}{order.city ? ` · ${order.city}` : ''}{order.address ? ` · ${order.address}` : ''}</p>
      {order.notes ? <p className="text-muted">Nota: {order.notes}</p> : null}
    </div>
  )
}

export function OrderTimeline({ order }: { order: Order }) {
  return (
    <ol className="space-y-2 border-l border-line pl-4 text-sm">
      {order.history.map((h, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-brand-600" />
          <span className="font-medium">{STATUS_LABEL[h.status]}</span>
          <span className="text-muted"> · {fmt.format(h.at)}{h.note ? ` · ${h.note}` : ''}</span>
        </li>
      ))}
    </ol>
  )
}

export function OrderBadges({ order }: { order: Order }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
      <Badge tone={order.paymentStatus === 'paid' ? 'success' : 'neutral'}>{PAYMENT_LABEL[order.paymentStatus]}</Badge>
    </div>
  )
}

export { fmt as orderDateFormat }
