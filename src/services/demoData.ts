import type { Category, CheckoutInput, Order, OrderStatus, Product, ProductInput } from '@/types/domain'
import { LOYALTY_RATE, NEXT_STATUS } from '@/features/orders/helpers'
import { productosConFotos } from './demoFotos'
import { listaUsados } from './demoInventory'
import { caseImg, chargerImg, cableImg, earbudsImg, glassImg, magsafeImg, phoneImg, powerbankImg } from './demoImages'

/** Datos de PRUEBA para desarrollo sin Firebase. Viven en memoria y se reinician al recargar. */

const now = Date.now()
const day = 86_400_000

const categories: Category[] = [
  { id: 'cat-iphone', slug: 'iphone', name: 'iPhone', order: 1 },
  { id: 'cat-cargadores', slug: 'cargadores', name: 'Cargadores y cables', order: 2 },
  { id: 'cat-protectores', slug: 'protectores', name: 'Fundas y protectores', order: 3 },
  { id: 'cat-audio', slug: 'audio', name: 'Audio y energía', order: 4 },
]

const base = { brand: 'Apple', active: true, createdAt: null as Date | null, updatedAt: null as Date | null }

function seed(): Product[] {
  return [
    { ...base, id: 'demo-1', slug: 'iphone-15-pro-prueba', name: 'iPhone 15 Pro · PRUEBA', kind: 'iphone', condition: 'new', categoryId: 'cat-iphone', featured: true,
      description: 'DATO DE PRUEBA. Equipo nuevo sellado. Pantalla Super Retina XDR, chip A17 Pro y cámara principal de 48 MP.',
      images: [phoneImg('#4b5a73'), phoneImg('#9a8f84'), phoneImg('#4b5a73', false, false)],
      specs: { Pantalla: '6.1"', Chip: 'A17 Pro', Conectividad: 'USB-C' },
      variants: [
        { id: 'v1', sku: 'DEMO-15P-128-AZ', capacity: '128 GB', color: 'Titanio azul', price: 4_899_000, compareAtPrice: 5_199_000, stock: 4 },
        { id: 'v2', sku: 'DEMO-15P-256-NA', capacity: '256 GB', color: 'Titanio natural', price: 5_499_000, stock: 2 },
        { id: 'v3', sku: 'DEMO-15P-512-NE', capacity: '512 GB', color: 'Titanio negro', price: 6_599_000, stock: 0 },
      ], createdAt: new Date(now - 1 * day), updatedAt: null },
    { ...base, id: 'demo-2', slug: 'iphone-14-usado-prueba', name: 'iPhone 14 · PRUEBA', kind: 'iphone', condition: 'used', categoryId: 'cat-iphone', featured: true,
      description: 'DATO DE PRUEBA. Equipo usado en excelente estado, IMEI legal verificado. Incluye cable de carga.',
      images: [phoneImg('#c0392b', true), phoneImg('#c0392b', true, false)],
      specs: { Pantalla: '6.1"', Chip: 'A15 Bionic', IMEI: 'Legal y verificado' },
      variants: [{ id: 'v1', sku: 'DEMO-14-128-RJ', capacity: '128 GB', color: 'Rojo', batteryHealth: 91, price: 2_750_000, stock: 1 }],
      createdAt: new Date(now - 2 * day), updatedAt: null },
    { ...base, id: 'demo-3', slug: 'iphone-13-usado-prueba', name: 'iPhone 13 · PRUEBA', kind: 'iphone', condition: 'used', categoryId: 'cat-iphone', featured: false,
      description: 'DATO DE PRUEBA. Equipo usado, IMEI legal. Pequeños signos de uso en el marco.',
      images: [phoneImg('#2c6e91', true)],
      specs: { Pantalla: '6.1"', Chip: 'A15 Bionic' },
      variants: [
        { id: 'v1', sku: 'DEMO-13-128-AZ', capacity: '128 GB', color: 'Azul', batteryHealth: 87, price: 1_950_000, stock: 2 },
        { id: 'v2', sku: 'DEMO-13-256-NE', capacity: '256 GB', color: 'Negro', batteryHealth: 89, price: 2_250_000, stock: 1 },
      ], createdAt: new Date(now - 3 * day), updatedAt: null },
    { ...base, id: 'demo-4', slug: 'iphone-16-prueba', name: 'iPhone 16 · PRUEBA', kind: 'iphone', condition: 'new', categoryId: 'cat-iphone', featured: true,
      description: 'DATO DE PRUEBA. Equipo nuevo sellado con botón de acción y chip A18.',
      images: [phoneImg('#1f8a70')],
      specs: { Pantalla: '6.1"', Chip: 'A18' },
      variants: [{ id: 'v1', sku: 'DEMO-16-128-VD', capacity: '128 GB', color: 'Verde', price: 4_399_000, stock: 0 }],
      createdAt: new Date(now - 4 * day), updatedAt: null },
    { ...base, id: 'demo-5', slug: 'cargador-20w-prueba', name: 'Cargador USB-C 20 W · PRUEBA', kind: 'accessory', condition: 'new', categoryId: 'cat-cargadores', featured: true,
      description: 'DATO DE PRUEBA. Cargador de pared USB-C de 20 W para carga rápida.',
      images: [chargerImg()], specs: { Potencia: '20 W', Puerto: 'USB-C' },
      variants: [{ id: 'v1', sku: 'DEMO-CARG-20', price: 89_000, stock: 15 }], createdAt: new Date(now - 5 * day), updatedAt: null },
    { ...base, id: 'demo-6', slug: 'cable-usbc-lightning-prueba', name: 'Cable USB-C a Lightning 1 m · PRUEBA', kind: 'accessory', condition: 'new', categoryId: 'cat-cargadores', featured: false,
      description: 'DATO DE PRUEBA. Cable de carga y datos de 1 metro.',
      images: [cableImg()], specs: { Longitud: '1 m' },
      variants: [{ id: 'v1', sku: 'DEMO-CAB-1M', price: 59_000, stock: 3 }], createdAt: new Date(now - 6 * day), updatedAt: null },
    { ...base, id: 'demo-7', slug: 'funda-silicona-prueba', name: 'Funda de silicona · PRUEBA', kind: 'accessory', condition: 'new', categoryId: 'cat-protectores', featured: false,
      description: 'DATO DE PRUEBA. Funda de silicona suave con interior de microfibra.',
      images: [caseImg('#f472b6'), caseImg('#1e293b')], specs: { Material: 'Silicona' },
      variants: [
        { id: 'v1', sku: 'DEMO-FUN-RS', color: 'Rosa', price: 69_000, stock: 8 },
        { id: 'v2', sku: 'DEMO-FUN-NE', color: 'Negro', price: 69_000, stock: 5 },
      ], createdAt: new Date(now - 7 * day), updatedAt: null },
    { ...base, id: 'demo-8', slug: 'vidrio-templado-prueba', name: 'Vidrio templado · PRUEBA', kind: 'accessory', condition: 'new', categoryId: 'cat-protectores', featured: false, active: false,
      description: 'DATO DE PRUEBA. Producto oculto: solo se ve en el panel de administración.',
      images: [glassImg()], specs: {},
      variants: [{ id: 'v1', sku: 'DEMO-VID', price: 25_000, stock: 20 }], createdAt: new Date(now - 8 * day), updatedAt: null },
    { ...base, id: 'demo-9', slug: 'audifonos-inalambricos-prueba', name: 'Audífonos inalámbricos · PRUEBA', kind: 'accessory', condition: 'new', categoryId: 'cat-audio', featured: true,
      description: 'DATO DE PRUEBA. Audífonos inalámbricos con estuche de carga y cancelación de ruido.',
      images: [earbudsImg()], specs: { Batería: 'Hasta 6 h', Estuche: 'Carga USB-C' },
      variants: [{ id: 'v1', sku: 'DEMO-AUD-N', price: 699_000, compareAtPrice: 789_000, stock: 6 }], createdAt: new Date(now - 0.5 * day), updatedAt: null },
    { ...base, id: 'demo-10', slug: 'audifonos-usados-prueba', name: 'Audífonos inalámbricos · PRUEBA', kind: 'accessory', condition: 'used', categoryId: 'cat-audio', featured: false,
      description: 'DATO DE PRUEBA. Audífonos usados, probados y funcionando. Estuche con señales de uso.',
      images: [earbudsImg(true)], specs: { Estado: 'Funcional, probado' },
      variants: [{ id: 'v1', sku: 'DEMO-AUD-U', batteryHealth: 85, price: 349_000, stock: 2 }], createdAt: new Date(now - 9 * day), updatedAt: null },
    { ...base, id: 'demo-11', slug: 'power-bank-prueba', name: 'Batería externa 10.000 mAh · PRUEBA', kind: 'accessory', condition: 'new', categoryId: 'cat-audio', featured: false,
      description: 'DATO DE PRUEBA. Batería externa compatible con carga magnética.',
      images: [powerbankImg()], specs: { Capacidad: '10.000 mAh' },
      variants: [{ id: 'v1', sku: 'DEMO-PB-10K', price: 189_000, stock: 9 }], createdAt: new Date(now - 10 * day), updatedAt: null },
    { ...base, id: 'demo-12', slug: 'magsafe-usado-prueba', name: 'Cargador inalámbrico MagSafe · PRUEBA', kind: 'accessory', condition: 'used', categoryId: 'cat-cargadores', featured: false,
      description: 'DATO DE PRUEBA. Cargador inalámbrico usado, funcionando perfectamente.',
      images: [magsafeImg(true)], specs: { Estado: 'Funcional' },
      variants: [{ id: 'v1', sku: 'DEMO-MAG-U', price: 129_000, stock: 1 }], createdAt: new Date(now - 11 * day), updatedAt: null },
    { ...base, id: 'demo-13', slug: 'magsafe-nuevo-prueba', name: 'Cargador inalámbrico MagSafe · PRUEBA', kind: 'accessory', condition: 'new', categoryId: 'cat-cargadores', featured: false,
      description: 'DATO DE PRUEBA. Cargador inalámbrico nuevo con cable USB-C de 1 m.',
      images: [magsafeImg()], specs: { Potencia: '15 W' },
      variants: [{ id: 'v1', sku: 'DEMO-MAG-N', price: 219_000, stock: 7 }], createdAt: new Date(now - 12 * day), updatedAt: null },
    ...productosConFotos(now),
    ...listaUsados(now),
  ]
}

let products = seed()
let cats = [...categories]

export const demoStore = {
  products: (onlyActive: boolean) => products.filter((p) => !onlyActive || p.active).map((p) => structuredClone(p)),
  byId: (id: string) => products.find((p) => p.id === id) ?? null,
  bySlug: (slug: string) => products.find((p) => p.slug === slug && p.active) ?? null,
  create(input: ProductInput): string {
    const id = `demo-${crypto.randomUUID().slice(0, 8)}`
    products = [{ ...input, id, createdAt: new Date(), updatedAt: new Date() }, ...products]
    return id
  },
  update(id: string, input: ProductInput): void {
    products = products.map((p) => (p.id === id ? { ...input, id, createdAt: p.createdAt, updatedAt: new Date() } : p))
  },
  categories: () => [...cats],
  addCategory(name: string): void {
    cats = [...cats, { id: `cat-${crypto.randomUUID().slice(0, 6)}`, slug: name.toLowerCase().replace(/\s+/g, '-'), name, order: cats.length + 1 }]
  },
}

/* ---------- Pedidos de PRUEBA ---------- */

export const DEMO_CUSTOMER = { uid: 'demo-customer-1', email: 'cliente@demo.local', name: 'Cliente de Prueba' }

const item = (productId: string, variantId: string, name: string, variantLabel: string, sku: string, unitPrice: number, qty = 1, kind: 'iphone' | 'accessory' = 'iphone') =>
  ({ productId, variantId, name, variantLabel, sku, kind, unitPrice, priceTier: 'retail' as const, qty })

const ev = (daysAgo: number, status: OrderStatus, note?: string) => ({ at: new Date(now - daysAgo * day), status, note })

let orderSeq = 3
let orders: Order[] = [
  { id: 'o-1', ref: 'TI-0001', customerId: DEMO_CUSTOMER.uid, customerName: DEMO_CUSTOMER.name, customerEmail: DEMO_CUSTOMER.email, phone: '3001234567',
    deliveryMethod: 'local', city: 'Bogotá', address: 'Calle 10 # 20-30', notes: '', items: [item('demo-5', 'v1', 'Cargador USB-C 20 W · PRUEBA', '', 'DEMO-CARG-20', 89_000, 1, 'accessory')],
    subtotal: 89_000, discount: 0, total: 89_000, status: 'delivered', paymentStatus: 'paid', createdAt: new Date(now - 20 * day),
    history: [ev(20, 'pending'), ev(20, 'confirmed'), ev(19, 'preparing'), ev(19, 'delivered')] },
  { id: 'o-2', ref: 'TI-0002', customerId: 'demo-customer-2', customerName: 'María Prueba', customerEmail: 'maria@demo.local', phone: '3109876543',
    deliveryMethod: 'national', city: 'Medellín', address: 'Carrera 43A # 5-10', notes: 'Enviar por Servientrega', items: [item('demo-2', 'v1', 'iPhone 14 · PRUEBA', '128 GB · Rojo', 'DEMO-14-128-RJ', 2_750_000)],
    subtotal: 2_750_000, discount: 0, total: 2_750_000, status: 'shipped', paymentStatus: 'paid', createdAt: new Date(now - 3 * day),
    history: [ev(3, 'pending'), ev(3, 'confirmed', 'Pago verificado por WhatsApp'), ev(2, 'preparing'), ev(1, 'shipped')] },
  { id: 'o-3', ref: 'TI-0003', customerId: 'demo-customer-3', customerName: 'Juan Prueba', customerEmail: 'juan@demo.local', phone: '3205551122',
    deliveryMethod: 'pickup', city: '', address: '', notes: '', items: [item('demo-1', 'v1', 'iPhone 15 Pro · PRUEBA', '128 GB · Titanio azul', 'DEMO-15P-128-AZ', 4_899_000), item('demo-9', 'v1', 'Audífonos inalámbricos · PRUEBA', '', 'DEMO-AUD-N', 699_000, 1, 'accessory')],
    subtotal: 5_598_000, discount: 0, total: 5_598_000, status: 'pending', paymentStatus: 'pending', createdAt: new Date(now - 0.1 * day), history: [ev(0.1, 'pending')] },
]

const lineCount = (items: { qty: number }[]) => items.reduce((n, i) => n + i.qty, 0)

export const demoOrders = {
  all: (): Order[] => orders.map((o) => structuredClone(o)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  byCustomer: (customerId: string): Order[] => demoOrders.all().filter((o) => o.customerId === customerId),
  hasCompletedPurchase: (customerId: string): boolean => orders.some((o) => o.customerId === customerId && o.status === 'delivered' && o.paymentStatus === 'paid'),

  create(input: CheckoutInput): Order {
    // Valida stock, precio y tier. En producción esto lo hace una Cloud Function con transacción.
    const unlocked = demoOrders.hasCompletedPurchase(input.customerId)
    for (const it of input.items) {
      const v = products.find((p) => p.id === it.productId)?.variants.find((x) => x.id === it.variantId)
      if (!v || v.stock < it.qty) throw new Error(`Sin stock suficiente de ${it.name}`)
      if (it.priceTier === 'wholesale' && !unlocked) throw new Error('El precio mayorista se habilita después de tu primera compra entregada y pagada.')
      const expected = it.priceTier === 'wholesale' ? v.wholesalePrice : v.price
      if (!expected || expected !== it.unitPrice) throw new Error(`El precio de ${it.name} cambió. Revisa tu carrito.`)
    }
    for (const it of input.items) {
      const v = products.find((p) => p.id === it.productId)!.variants.find((x) => x.id === it.variantId)!
      v.stock -= it.qty
    }
    const subtotal = input.items.reduce((n, i) => n + i.unitPrice * i.qty, 0)
    const returning = orders.some((o) => o.customerId === input.customerId && o.status !== 'cancelled')
    const multiIphone = lineCount(input.items.filter((i) => i.kind === 'iphone')) > 1
    const discount = returning || multiIphone ? Math.round(subtotal * LOYALTY_RATE) : 0
    orderSeq += 1
    const order: Order = {
      ...input, id: `o-${orderSeq}`, ref: `TI-${String(orderSeq).padStart(4, '0')}`,
      subtotal, discount, total: subtotal - discount, status: 'pending', paymentStatus: 'pending',
      createdAt: new Date(), history: [{ at: new Date(), status: 'pending' }],
    }
    orders = [order, ...orders]
    return structuredClone(order)
  },

  setStatus(id: string, status: OrderStatus, note?: string): void {
    const o = orders.find((x) => x.id === id)
    if (!o) throw new Error('Pedido no encontrado')
    if (!NEXT_STATUS[o.status].includes(status)) throw new Error('Cambio de estado no permitido')
    if (status === 'cancelled') {
      for (const it of o.items) {
        const v = products.find((p) => p.id === it.productId)?.variants.find((x) => x.id === it.variantId)
        if (v) v.stock += it.qty
      }
    }
    o.status = status
    o.history = [...o.history, { at: new Date(), status, note }]
  },

  setPayment(id: string, paid: boolean): void {
    const o = orders.find((x) => x.id === id)
    if (!o) throw new Error('Pedido no encontrado')
    if (o.status === 'cancelled') throw new Error('Un pedido cancelado no puede marcarse como pagado')
    o.paymentStatus = paid ? 'paid' : 'pending'
  },
}
