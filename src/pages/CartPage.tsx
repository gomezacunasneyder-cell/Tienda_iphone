import { ArrowLeft, ArrowRight, MessageCircle, Minus, Plus, ShoppingCart, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/components/ui/Button'
import { useCart } from '@/features/cart/CartContext'
import { formatCOP } from '@/lib/utils'

const STEPS = [
  'Envías tu pedido: queda registrado con una referencia.',
  'Te escribimos por WhatsApp para confirmar disponibilidad, dirección y envío.',
  'Recibes tu pedido y pagas al recibirlo.',
]

export default function CartPage() {
  const { items, count, subtotal, setQty, remove } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-2xl bg-card ring-1 ring-line"><ShoppingCart className="size-9 text-muted" aria-hidden /></span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-muted">Explora el catálogo y agrega tu próximo iPhone o accesorio.</p>
        <Link to="/catalogo" className={buttonClasses({ size: 'lg', className: 'mt-6' })}>Ver el catálogo<ArrowRight className="size-4" aria-hidden /></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 max-lg:pb-28 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12 lg:py-12">
      <section aria-labelledby="carrito-titulo">
        <h1 id="carrito-titulo" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Tu carrito ({count})</h1>

        <ul className="mt-6 divide-y divide-line border-b border-line" aria-label="Productos en el carrito">
          {items.map((i) => (
            <li key={i.variantId} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 py-5 sm:grid-cols-[5rem_minmax(0,1fr)_auto_7.5rem_auto] sm:gap-x-6">
              <div className="size-[4.5rem] overflow-hidden rounded-xl bg-white shadow-[0_10px_24px_-14px_rgb(0_0_0/0.8)] sm:size-20">
                {i.image ? <img src={i.image} alt="" loading="lazy" className="size-full object-contain p-1" /> : null}
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-snug text-white">{i.name}</p>
                {i.variantLabel ? <p className="mt-0.5 text-xs text-muted">{i.variantLabel}</p> : null}
                <p className="mt-1 text-xs text-muted">
                  {formatCOP(i.unitPrice)} c/u
                  {i.priceTier === 'wholesale' ? <span className="ml-2 rounded-full bg-butter px-2 py-0.5 font-semibold text-butter-ink">Mayorista</span> : null}
                </p>
              </div>
              <button type="button" aria-label={`Quitar ${i.name}`} onClick={() => remove(i.variantId)}
                className="grid size-10 place-items-center self-start rounded-full text-muted transition hover:bg-white/5 hover:text-white sm:order-last sm:self-center">
                <X className="size-5" aria-hidden />
              </button>
              <div className="col-span-2 col-start-2 flex items-center justify-between gap-3 sm:col-span-1 sm:col-start-auto sm:contents">
                <div role="group" aria-label={`Cantidad de ${i.name}`} className="inline-flex h-10 items-center rounded-lg ring-1 ring-line-strong">
                  <button type="button" aria-label="Menos" onClick={() => setQty(i.variantId, i.qty - 1)} disabled={i.qty <= 1} className="grid h-full w-10 place-items-center text-ink/85 transition hover:text-white disabled:opacity-35"><Minus className="size-3.5" aria-hidden /></button>
                  <output aria-live="polite" className="w-6 text-center text-sm font-semibold tabular-nums"><span key={i.qty} className="qty-num">{i.qty}</span></output>
                  <button type="button" aria-label="Más" onClick={() => setQty(i.variantId, i.qty + 1)} className="grid h-full w-10 place-items-center text-ink/85 transition hover:text-white"><Plus className="size-3.5" aria-hidden /></button>
                </div>
                <p className="price text-right text-lg font-semibold text-brand-400 sm:text-xl">{formatCOP(i.unitPrice * i.qty)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/catalogo" className="inline-flex min-h-11 items-center gap-3 text-sm text-ink/90 transition hover:text-white"><ArrowLeft className="size-5" aria-hidden />Seguir comprando</Link>
          <p className="flex items-baseline gap-3 text-sm text-ink/85">Subtotal:<span className="price text-3xl font-light text-brand-400 sm:text-4xl">{formatCOP(subtotal)}</span></p>
        </div>
      </section>

      <aside aria-labelledby="pago-titulo" className="panel rounded-2xl p-5 shadow-[var(--shadow-soft)] sm:p-6 lg:sticky lg:top-36">
        <h2 id="pago-titulo" className="text-lg font-semibold text-white">Pago</h2>
        <p className="mt-4 flex items-center gap-2.5 text-sm text-white">
          <span aria-hidden className="grid size-[18px] place-items-center rounded-full ring-2 ring-emerald-400"><span className="size-2 rounded-full bg-emerald-400" /></span>
          Pago contraentrega
        </p>
        <p className="mt-1.5 pl-7 text-xs text-muted">Sin pagos en línea: pagas al recibir tu pedido.</p>

        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted">Subtotal</dt><dd className="price font-semibold text-white">{formatCOP(subtotal)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Envío</dt><dd className="text-right text-ink">Se acuerda por WhatsApp</dd></div>
        </dl>
        <p className="mt-2 text-xs text-muted">Envío y descuentos de fidelidad se calculan al confirmar el pedido.</p>

        <ol className="mt-5 space-y-3 border-t border-line pt-4" aria-label="Cómo sigue tu compra">
          {STEPS.map((s, n) => <li key={s} className="flex gap-3 text-xs leading-relaxed text-ink/85"><span className="step-num size-6 text-[11px]">{n + 1}</span><span className="pt-0.5">{s}</span></li>)}
        </ol>

        <div className="mt-6 grid grid-cols-[auto_1fr] gap-3 max-lg:hidden">
          <Link to="/catalogo" className={buttonClasses({ variant: 'outline', className: 'px-5' })}>Ver más</Link>
          <Link to="/checkout" className={buttonClasses({ className: 'whitespace-nowrap' })}>Finalizar pedido</Link>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted"><MessageCircle className="size-3.5 text-[#25d366]" aria-hidden />Coordinamos la entrega por WhatsApp</p>
      </aside>

      {/* Móvil: total y botón siempre a la vista */}
      <div className="buy-bar flex items-center gap-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">Subtotal</p>
          <p className="price text-lg font-bold text-brand-400">{formatCOP(subtotal)}</p>
        </div>
        <Link to="/checkout" className={buttonClasses({ size: 'md', className: 'shrink-0' })}>Finalizar pedido<ArrowRight className="size-4" aria-hidden /></Link>
      </div>
    </div>
  )
}
