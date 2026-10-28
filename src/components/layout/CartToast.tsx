import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CART_ADDED, type CartAddedDetail } from '@/lib/cartFx'

/** Aviso flotante "Agregado al carrito" que aparece cuando termina la animación de vuelo. */
export function CartToast() {
  const [item, setItem] = useState<(CartAddedDetail & { key: number }) | null>(null)

  useEffect(() => {
    const on = (e: Event) => setItem({ ...(e as CustomEvent<CartAddedDetail>).detail, key: Date.now() })
    addEventListener(CART_ADDED, on)
    return () => removeEventListener(CART_ADDED, on)
  }, [])

  useEffect(() => {
    if (!item) return
    const t = window.setTimeout(() => setItem(null), 3800)
    return () => window.clearTimeout(t)
  }, [item])

  if (!item) return null
  return (
    <div key={item.key} role="status" className="cart-toast">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-surface">
        {item.image ? <img src={item.image} alt="" className="size-full object-cover" /> : null}
        <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-surface"><Check className="size-3" aria-hidden /></span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-mint-ink">Agregado al carrito{item.qty > 1 ? ` · ${item.qty} unidades` : ''}</span>
        <span className="block truncate text-sm font-medium">{item.name}</span>
      </span>
      <Link to="/carrito" onClick={() => setItem(null)} className="shrink-0 rounded-full bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-500">Ver carrito</Link>
      <button type="button" aria-label="Cerrar aviso" onClick={() => setItem(null)} className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-white/10"><X className="size-4" aria-hidden /></button>
    </div>
  )
}
