import { DEMO_MODE } from './firebase'
import { demoOrders } from './demoData'
import type { CheckoutInput, Order, OrderStatus } from '@/types/domain'

/**
 * Pedidos reales: se implementan en la etapa de Firebase con una Cloud Function
 * (precios, stock, descuentos y transiciones validados en el servidor).
 * Hoy solo funciona el modo demostración.
 */
const notReady = (): never => {
  throw new Error('Los pedidos reales se activan en la etapa de Firebase (Cloud Function).')
}

export const listMyOrders = async (customerId: string): Promise<Order[]> => (DEMO_MODE ? demoOrders.byCustomer(customerId) : notReady())
export const listAllOrders = async (): Promise<Order[]> => (DEMO_MODE ? demoOrders.all() : notReady())
export const createOrder = async (input: CheckoutInput): Promise<Order> => (DEMO_MODE ? demoOrders.create(input) : notReady())
export const updateOrderStatus = async (id: string, status: OrderStatus, note?: string): Promise<void> => (DEMO_MODE ? demoOrders.setStatus(id, status, note) : notReady())
export const setOrderPaid = async (id: string, paid: boolean): Promise<void> => (DEMO_MODE ? demoOrders.setPayment(id, paid) : notReady())
