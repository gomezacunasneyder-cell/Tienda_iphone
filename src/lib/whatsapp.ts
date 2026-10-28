import { BRAND } from '@/config/brand'
import { DELIVERY_LABEL } from '@/features/orders/helpers'
import { formatCOP } from '@/lib/utils'
import type { Order } from '@/types/domain'

export function orderWhatsAppUrl(order: Order): string | undefined {
  if (!BRAND.whatsappNumber) return undefined
  const lines = [
    `Hola, acabo de hacer el pedido ${order.ref}.`,
    ...order.items.map((i) => `• ${i.qty} x ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''} - ${formatCOP(i.unitPrice * i.qty)}`),
    `Total: ${formatCOP(order.total)} (envío por acordar)`,
    `Entrega: ${DELIVERY_LABEL[order.deliveryMethod]}${order.city ? ` - ${order.city}` : ''}`,
    'Quedo atento para coordinar el pago y la entrega.',
  ]
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`
}
