export type Role = 'admin' | 'seller'
export type ProductKind = 'iphone' | 'accessory'
export type Condition = 'new' | 'used'
export type SimType = 'esim' | 'physical' | 'both'
export type PriceTier = 'retail' | 'wholesale'

export interface ProductVariant {
  id: string
  sku: string
  /** Ej. "128 GB". Solo para equipos. */
  capacity?: string
  color?: string
  /** Estado de batería en %, solo para usados. */
  batteryHealth?: number
  /** Precio al detal, entero en COP. 0 = por definir (no se muestra en las secciones al detal). */
  price: number
  /** Precio al por mayor. Se muestra solo a clientes registrados; se compra con tier mayorista. */
  wholesalePrice?: number
  simType?: SimType
  /** Aviso visible al cliente, ej. "Batería de segunda mano original". */
  note?: string
  compareAtPrice?: number
  stock: number
}

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  kind: ProductKind
  condition: Condition
  categoryId: string
  description: string
  images: string[]
  specs: Record<string, string>
  variants: ProductVariant[]
  active: boolean
  featured: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface Category {
  id: string
  slug: string
  name: string
  order: number
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid'
export type DeliveryMethod = 'local' | 'national' | 'pickup'

export interface OrderItem {
  productId: string
  variantId: string
  name: string
  variantLabel: string
  sku: string
  kind: ProductKind
  image?: string
  unitPrice: number
  priceTier: PriceTier
  qty: number
}

export interface OrderEvent { at: Date; status: OrderStatus; note?: string }

export interface Order {
  id: string
  /** Referencia corta que el cliente ve y envía por WhatsApp. */
  ref: string
  customerId: string
  customerName: string
  customerEmail: string | null
  phone: string
  deliveryMethod: DeliveryMethod
  city: string
  address: string
  notes: string
  items: OrderItem[]
  subtotal: number
  discount: number
  /** Costo de envío: se acuerda por WhatsApp, no se calcula aquí. */
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: Date
  history: OrderEvent[]
}

export interface CheckoutInput {
  customerId: string
  customerName: string
  customerEmail: string | null
  phone: string
  deliveryMethod: DeliveryMethod
  city: string
  address: string
  notes: string
  items: OrderItem[]
}

/** Opinión de un cliente que compró el producto. Solo se publica tras un pedido entregado (lo valida el servidor). */
export interface Review {
  id: string
  productId: string
  author: string
  city?: string
  /** 1 a 5 estrellas. */
  rating: number
  text: string
  /** Variante que compró, ej. "128 GB · Azul". */
  variantLabel?: string
  verified: boolean
  createdAt: Date
}
