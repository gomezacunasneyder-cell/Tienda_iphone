import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { OrderItem } from '@/types/domain'

const KEY = 'tienda:cart:v1'

interface CartState {
  items: OrderItem[]
  count: number
  subtotal: number
  add: (item: OrderItem) => void
  setQty: (variantId: string, qty: number) => void
  remove: (variantId: string) => void
  clear: () => void
}

const CartContext = createContext<CartState | null>(null)

function load(): OrderItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as OrderItem[]) : []
  } catch {
    return []
  }
}

/** El carrito guarda un resumen para mostrarlo; precios y stock se revalidan al crear el pedido. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* almacenamiento no disponible */ }
  }, [items])

  const value = useMemo<CartState>(() => ({
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.unitPrice * i.qty, 0),
    add: (item) => setItems((cur) => {
      const found = cur.find((i) => i.variantId === item.variantId)
      return found ? cur.map((i) => (i.variantId === item.variantId ? { ...i, qty: Math.min(i.qty + item.qty, 10) } : i)) : [...cur, item]
    }),
    setQty: (variantId, qty) => setItems((cur) => cur.map((i) => (i.variantId === variantId ? { ...i, qty: Math.max(1, Math.min(qty, 10)) } : i))),
    remove: (variantId) => setItems((cur) => cur.filter((i) => i.variantId !== variantId)),
    clear: () => setItems([]),
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
