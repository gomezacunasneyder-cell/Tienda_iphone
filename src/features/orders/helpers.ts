import type { DeliveryMethod, OrderStatus, PaymentStatus } from '@/types/domain'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'En preparación',
  shipped: 'En camino', delivered: 'Entregado', cancelled: 'Cancelado',
}
export const STATUS_TONE: Record<OrderStatus, 'neutral' | 'brand' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning', confirmed: 'brand', preparing: 'brand', shipped: 'brand', delivered: 'success', cancelled: 'danger',
}
export const PAYMENT_LABEL: Record<PaymentStatus, string> = { pending: 'Pago pendiente', paid: 'Pagado' }
export const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  local: 'Domicilio en la ciudad', national: 'Envío nacional', pickup: 'Punto físico de entrega',
}

/** Transiciones válidas. El servidor debe volver a validarlas (Cloud Function) en la etapa de Firebase. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

/** Desactivado: el precio mayorista tras la primera compra cumple ese papel. Se reactiva si el dueño define un descuento por varios equipos. */
export const LOYALTY_RATE = 0
