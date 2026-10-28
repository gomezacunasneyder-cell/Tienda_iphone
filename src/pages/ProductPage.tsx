import { BadgeCheck, Check, ChevronDown, ChevronLeft, ChevronRight, House, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck, Wallet, Zap } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States'
import { BRAND } from '@/config/brand'
import { useCart } from '@/features/cart/CartContext'
import { colorSwatch } from '@/features/catalog/colors'
import { conditionLabel, hasRetail, SIM_LABEL, variantLabel } from '@/features/catalog/helpers'
import { ProductGrid } from '@/features/catalog/ProductCard'
import { useWholesaleAccess } from '@/features/orders/useWholesaleAccess'
import { useProduct, useProducts, useReviews } from '@/hooks/useCatalog'
import { flyToCart } from '@/lib/cartFx'
import { cn, formatCOP } from '@/lib/utils'
import { DEMO_MODE } from '@/services/firebase'
import type { PriceTier, ProductVariant, Review } from '@/types/domain'

const MAX_QTY = 10
const uniq = <T,>(list: (T | undefined)[]): T[] => [...new Set(list.filter((x): x is T => x !== undefined && x !== ''))]

function Stars({ value, className }: { value: number; className?: string }) {
  const full = Math.round(value)
  return (
    <span className={cn('stars', className)} role="img" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn('size-4', i > full && 'off')} fill="currentColor" strokeWidth={0} aria-hidden />)}
    </span>
  )
}

const AVATAR_TONES = ['bg-rose text-rose-ink', 'bg-lilac text-lilac-ink', 'bg-sky text-sky-ink', 'bg-mint text-mint-ink', 'bg-peach text-peach-ink']
const reviewDate = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

function Reviews({ reviews, loading }: { reviews: Review[]; loading: boolean }) {
  const count = reviews.length
  const avg = count ? reviews.reduce((n, r) => n + r.rating, 0) / count : 0
  return (
    <section id="opiniones" aria-labelledby="opiniones-titulo" className="mt-14 scroll-mt-32">
      <h2 id="opiniones-titulo" className="section-title text-2xl font-bold tracking-tight">Calificaciones de clientes</h2>
      {DEMO_MODE ? <p className="mt-3 text-xs text-muted">Vista previa: estas opiniones son de ejemplo. En la tienda real solo aparecen opiniones de clientes con compra entregada.</p> : null}
      {loading ? <Spinner label="Cargando opiniones" /> : count === 0 ? (
        <p className="panel mt-5 rounded-2xl p-6 text-sm text-muted">Este artículo aún no tiene calificaciones. ¡Sé el primero en comprarlo y contarnos qué tal!</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="panel h-fit rounded-2xl p-6 lg:sticky lg:top-32">
            <p className="text-5xl font-extrabold tracking-tight text-white">{avg.toFixed(1)}</p>
            <Stars value={avg} className="mt-2" />
            <p className="mt-1 text-sm text-muted">{count} {count === 1 ? 'calificación' : 'calificaciones'}</p>
            <ul className="mt-5 space-y-2" aria-label="Distribución de calificaciones">
              {[5, 4, 3, 2, 1].map((n, i) => {
                const k = reviews.filter((r) => r.rating === n).length
                return (
                  <li key={n} className="grid grid-cols-[1.5rem_1fr_1.5rem] items-center gap-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-0.5">{n}<Star className="size-3 text-amber-400" fill="currentColor" strokeWidth={0} aria-hidden /></span>
                    <span className="rating-bar"><span style={{ width: `${(k / count) * 100}%`, animationDelay: `${i * 90}ms` }} /></span>
                    <span className="text-right tabular-nums">{k}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {reviews.map((r, i) => (
              <Reveal as="li" key={r.id} delay={i * 70} className="panel flex flex-col gap-3 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold', AVATAR_TONES[i % AVATAR_TONES.length])}>{r.author.slice(0, 1)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.author}{r.city ? <span className="font-normal text-muted"> · {r.city}</span> : null}</p>
                    <p className="text-xs text-muted">{reviewDate.format(r.createdAt)}</p>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.verified ? <p className="inline-flex w-fit items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-mint-ink"><BadgeCheck className="size-3.5" aria-hidden />Compra verificada{r.variantLabel ? ` · ${r.variantLabel}` : ''}</p> : null}
                <p className="text-sm leading-relaxed text-ink/85">{r.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

/** Se monta de nuevo al cambiar de producto (key = slug): la selección de color, cantidad y foto arranca limpia. */
export default function ProductPage() {
  const { slug } = useParams()
  return <ProductDetail key={slug} slug={slug} />
}

function ProductDetail({ slug }: { slug: string | undefined }) {
  const navigate = useNavigate()
  const { data: product, isLoading, isError, refetch } = useProduct(slug)
  const { data: all } = useProducts()
  const { data: reviews, isLoading: loadingReviews } = useReviews(product)
  const [color, setColor] = useState<string>()
  const [capacity, setCapacity] = useState<string>()
  const [unitId, setUnitId] = useState<string>()
  const [qty, setQty] = useState(1)
  const [imageIdx, setImageIdx] = useState(0)
  const [added, setAdded] = useState<PriceTier>()
  const cart = useCart()
  const { signedIn, canBuy } = useWholesaleAccess()
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (product) document.title = `${product.name} · ${BRAND.name}`
    return () => { document.title = BRAND.name }
  }, [product])

  // Al abrir un producto (también desde "relacionados"), empezar arriba
  useEffect(() => { window.scrollTo({ top: 0 }) }, [])

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!product) return <EmptyState title="Producto no encontrado">Puede que ya no esté disponible.</EmptyState>

  const inStock = (v: ProductVariant) => v.stock > 0
  const fallback = product.variants.find(inStock) ?? product.variants[0]!
  // Selección en cascada: color → capacidad → unidad
  const colors = uniq(product.variants.map((v) => v.color))
  const activeColor = color && colors.includes(color) ? color : fallback.color
  const byColor = product.variants.filter((v) => !activeColor || v.color === activeColor)
  const capacities = uniq(byColor.map((v) => v.capacity))
  const firstCap = (byColor.find(inStock) ?? byColor[0])?.capacity
  const activeCap = capacity && capacities.includes(capacity) ? capacity : firstCap
  const candidates = byColor.filter((v) => !activeCap || v.capacity === activeCap)
  const variant = candidates.find((v) => v.id === unitId) ?? candidates.find(inStock) ?? candidates[0] ?? fallback

  const image = product.images[imageIdx] ?? product.images[0]
  const specs = Object.entries(product.specs)
  const label = variantLabel(variant)
  const retailPrice = variant.price > 0 ? variant.price : null
  const wholesalePrice = variant.wholesalePrice && variant.wholesalePrice > 0 ? variant.wholesalePrice : null
  const soldOut = variant.stock === 0
  const maxQty = Math.max(1, Math.min(variant.stock, MAX_QTY))
  const amount = Math.min(qty, maxQty)
  const ratingAvg = reviews?.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0
  const related = (all ?? []).filter((p) => p.id !== product.id && p.kind === product.kind && hasRetail(p)).slice(0, 4)

  const pick = (next: () => void) => { next(); setUnitId(undefined); setQty(1) }

  const addToCart = (tier: PriceTier, then?: () => void) => {
    const unitPrice = tier === 'wholesale' ? wholesalePrice : retailPrice
    if (!unitPrice) return
    cart.add({ productId: product.id, variantId: variant.id, name: product.name, variantLabel: label, sku: variant.sku, kind: product.kind, image: product.images[0], unitPrice, priceTier: tier, qty: amount })
    if (then) { then(); return }
    flyToCart(galleryRef.current, { name: product.name, image: image?.startsWith('data:') ? undefined : image, qty: amount })
    setAdded(tier)
    setTimeout(() => setAdded(undefined), 1800)
  }

  const shownPrice = retailPrice ?? (signedIn ? wholesalePrice : null)
  const message = encodeURIComponent(
    `Hola, me interesa: ${product.name}${label ? ` (${label})` : ''} (${conditionLabel(product.condition)})${amount > 1 ? ` x${amount}` : ''}${shownPrice ? ` - ${formatCOP(shownPrice)}` : ''}. Ref: ${variant.sku}`,
  )
  const waHref = BRAND.whatsappNumber ? `https://wa.me/${BRAND.whatsappNumber}?text=${message}` : undefined
  const stockText = soldOut ? 'Agotado' : variant.stock === 1 ? 'Última unidad' : variant.stock <= 3 ? `Últimas ${variant.stock} unidades` : `${variant.stock} disponibles`

  const images = product.images
  const showImage = (i: number) => setImageIdx((i + images.length) % images.length)
  const showBuyBar = Boolean(retailPrice) && !soldOut
  const discount = retailPrice && variant.compareAtPrice && variant.compareAtPrice > retailPrice ? Math.round((1 - retailPrice / variant.compareAtPrice) * 100) : 0
  const keySpecs = [...(variant.capacity ? [['Capacidad', variant.capacity]] : []), ...specs.filter(([k]) => k !== 'Capacidad')].slice(0, 4)
  /** Diferencia de precio de cada capacidad frente a la unidad elegida (solo informativa). */
  const capDelta = (c: string): number => {
    const prices = byColor.filter((v) => v.capacity === c && inStock(v) && v.price > 0).map((v) => v.price)
    return prices.length && retailPrice ? Math.min(...prices) - retailPrice : 0
  }
  const signedCOP = (n: number) => `${n > 0 ? '+' : '−'}${formatCOP(Math.abs(n))}`

  const notes = [
    product.condition === 'used' ? { icon: ShieldCheck, text: 'IMEI legal verificado: equipo revisado antes de la venta.' } : { icon: BadgeCheck, text: 'Nuevo y sellado en su caja original.' },
    { icon: Wallet, text: 'Pago contraentrega, coordinado contigo por WhatsApp.' },
    { icon: Truck, text: `Domicilio en Cúcuta o envío nacional. ${BRAND.pickup}.` },
  ]

  return (
    <div className={cn('mx-auto max-w-7xl px-4 py-5 sm:py-6', showBuyBar && 'max-lg:pb-28')}>
      <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/" aria-label="Inicio" className="transition hover:text-ink"><House className="size-4" aria-hidden /></Link>
        <ChevronRight className="size-3.5 opacity-60" aria-hidden />
        <Link to="/catalogo" className="transition hover:text-ink">Catálogo</Link>
        <ChevronRight className="size-3.5 opacity-60" aria-hidden />
        <span aria-current="page" className="max-w-[14rem] truncate font-medium text-ink sm:max-w-xs">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        {/* Galería: miniaturas en columna a la izquierda (escritorio) y en fila debajo (móvil) */}
        <div className="animate-fade-up flex flex-col-reverse gap-3 lg:sticky lg:top-36 lg:flex-row lg:self-start">
          {images.length > 1 ? (
            <ul className="no-scrollbar flex shrink-0 gap-2.5 overflow-x-auto p-1 lg:max-h-[560px] lg:flex-col lg:overflow-y-auto">
              {images.map((src, i) => (
                <li key={src}>
                  <button type="button" aria-label={`Ver imagen ${i + 1}`} aria-current={i === imageIdx} onClick={() => setImageIdx(i)}
                    className="thumb block size-16 overflow-hidden rounded-xl bg-white ring-1 ring-line-strong sm:size-[72px]">
                    <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div ref={galleryRef} className="gallery-stage aspect-square flex-1 sm:aspect-[4/5]">
            {image ? (
              <img key={image} src={image} alt={images.length > 1 ? `${product.name}, imagen ${imageIdx + 1} de ${images.length}` : product.name}
                className={cn('animate-fade-up absolute inset-0 size-full object-contain', image.startsWith('data:') ? 'p-8' : 'p-3')} />
            ) : <div className="grid size-full place-items-center text-muted">Sin imagen</div>}
            <div className="absolute left-4 top-4 flex gap-2">
              <Badge tone={product.condition === 'new' ? 'brand' : 'used'}>{conditionLabel(product.condition)}</Badge>
              {product.condition === 'used' ? <Badge tone="success">IMEI legal</Badge> : null}
            </div>
            {images.length > 1 ? (
              <>
                <button type="button" aria-label="Imagen anterior" onClick={() => showImage(imageIdx - 1)} className="gallery-nav absolute left-3 top-1/2 -translate-y-1/2"><ChevronLeft className="size-5" aria-hidden /></button>
                <button type="button" aria-label="Imagen siguiente" onClick={() => showImage(imageIdx + 1)} className="gallery-nav absolute right-3 top-1/2 -translate-y-1/2"><ChevronRight className="size-5" aria-hidden /></button>
              </>
            ) : null}
          </div>
        </div>

        {/* Información y compra */}
        <div className="animate-fade-up [animation-delay:80ms]">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-[2rem]">{product.name}</h1>
          <p className="mt-2 text-sm text-muted"><span className="font-semibold text-ink underline underline-offset-2">{product.brand}</span> · Ref.: {variant.sku}</p>
          {reviews?.length ? (
            <a href="#opiniones" className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <Stars value={ratingAvg} />({reviews.length} {reviews.length === 1 ? 'calificación' : 'calificaciones'})
            </a>
          ) : null}

          {keySpecs.length ? (
            <dl className="mt-5 grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-6 gap-y-2 text-sm">
              {keySpecs.map(([k, v]) => <div key={k} className="contents"><dt className="text-ink/85">{k}</dt><dd className="text-muted">{v}</dd></div>)}
            </dl>
          ) : null}

          <div className="mt-6 space-y-5">
            {colors.length ? (
              <label className="block">
                <span className="text-sm text-muted">Color</span>
                <span className="relative mt-2 flex max-w-sm items-center">
                  {activeColor ? <span aria-hidden className="pointer-events-none absolute left-3.5 size-4 rounded-full ring-1 ring-white/30" style={{ background: colorSwatch(activeColor) } as CSSProperties} /> : null}
                  <select value={activeColor} onChange={(e) => pick(() => setColor(e.target.value))}
                    className="h-12 w-full cursor-pointer appearance-none rounded-xl bg-surface pl-10 pr-10 text-sm font-medium text-ink ring-1 ring-line-strong focus:outline-none focus:ring-brand-500/60">
                    {colors.map((c) => {
                      const available = product.variants.some((v) => v.color === c && inStock(v))
                      return <option key={c} value={c} disabled={!available}>{c}{available ? '' : ' (agotado)'}</option>
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-muted" aria-hidden />
                </span>
              </label>
            ) : null}

            {capacities.length ? (
              <fieldset>
                <legend className="text-sm text-muted">Capacidad</legend>
                <div className="mt-2 grid max-w-md grid-cols-3 gap-2">
                  {capacities.map((c) => {
                    const delta = c === activeCap ? 0 : capDelta(c)
                    return (
                      <button key={c} type="button" aria-pressed={c === activeCap} disabled={!byColor.some((v) => v.capacity === c && inStock(v))}
                        onClick={() => pick(() => setCapacity(c))} className="option-pill flex-col justify-center gap-0 rounded-full py-1.5">
                        <span>{c}</span>{delta ? <span className="text-[11px] font-normal text-muted">{signedCOP(delta)}</span> : null}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}

            {candidates.length > 1 ? (
              <fieldset>
                <legend className="text-sm text-muted">{product.condition === 'used' ? 'Unidad disponible' : 'Opción'}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {candidates.map((v) => (
                    <button key={v.id} type="button" aria-pressed={v.id === variant.id} disabled={!inStock(v)} onClick={() => { setUnitId(v.id); setQty(1) }} className="option-pill rounded-full">
                      {v.batteryHealth ? <><Zap className="size-3.5 text-mint-ink" aria-hidden />Batería {v.batteryHealth}%</> : v.simType ? SIM_LABEL[v.simType] : v.sku}
                      {v.price > 0 ? <span className="text-muted">· {formatCOP(v.price)}</span> : null}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {variant.note ? <p className="rounded-xl bg-butter p-3 text-sm text-butter-ink ring-1 ring-yellow-400/20">{variant.note}</p> : null}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1">
            {retailPrice ? (
              <>
                <p className="price text-4xl font-bold text-white sm:text-[2.6rem]">{formatCOP(retailPrice * amount)}</p>
                {discount ? <span className="rounded-md bg-brand-600 px-1.5 py-0.5 text-xs font-bold text-white">−{discount}%</span> : null}
                {discount ? <p className="text-base text-muted line-through">{formatCOP(variant.compareAtPrice! * amount)}</p> : null}
                {amount > 1 ? <p className="w-full text-sm text-muted">{formatCOP(retailPrice)} c/u</p> : null}
              </>
            ) : <p className="text-lg font-medium text-muted">Precio al detal por definir</p>}
          </div>
          <p className={cn('mt-2 inline-flex items-center gap-1.5 text-xs font-semibold', soldOut ? 'text-red-300' : 'text-mint-ink')}>
            <span className={cn('size-1.5 rounded-full', soldOut ? 'bg-red-400' : 'bg-emerald-400')} />{stockText}
          </p>

          {retailPrice ? (
            <div className="mt-5 flex items-center gap-3">
              <div className="qty shrink-0">
                <button type="button" aria-label="Disminuir cantidad" disabled={amount <= 1 || soldOut} onClick={() => setQty(Math.max(1, amount - 1))}><Minus className="size-4" aria-hidden /></button>
                <output aria-live="polite" aria-label="Cantidad"><span key={amount} className="qty-num">{amount}</span></output>
                <button type="button" aria-label="Aumentar cantidad" disabled={amount >= maxQty || soldOut} onClick={() => setQty(Math.min(maxQty, amount + 1))}><Plus className="size-4" aria-hidden /></button>
              </div>
              <Button size="lg" className="flex-1" disabled={soldOut} onClick={() => addToCart('retail')}>
                {added === 'retail' ? <><Check className="size-5" aria-hidden />¡Agregado!</> : <><ShoppingBag className="size-5" aria-hidden />Agregar al carrito</>}
              </Button>
            </div>
          ) : null}
          {!soldOut && retailPrice ? <p className="mt-2 text-xs text-muted">{amount >= maxQty ? `Máximo ${maxQty} por pedido` : `Puedes pedir hasta ${maxQty}`}</p> : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            {retailPrice ? (
              <button type="button" disabled={soldOut} onClick={() => addToCart('retail', () => void navigate('/carrito'))} className="inline-flex min-h-10 items-center gap-2 text-ink/90 transition hover:text-white disabled:opacity-40">
                <Zap className="size-4 text-brand-500" aria-hidden />Comprar ahora
              </button>
            ) : null}
            {waHref ? (
              <a href={waHref} target="_blank" rel="noreferrer" aria-disabled={soldOut} className={cn('inline-flex min-h-10 items-center gap-2 text-ink/90 transition hover:text-white', soldOut && 'pointer-events-none opacity-40')}>
                <MessageCircle className="size-4 text-[#25d366]" aria-hidden />Consultar disponibilidad
              </a>
            ) : null}
            <a href="#entrega" className="inline-flex min-h-10 items-center gap-2 text-ink/90 transition hover:text-white"><Truck className="size-4 text-muted" aria-hidden />Ver entrega</a>
          </div>

          {wholesalePrice ? (
            <div className="panel mt-5 rounded-xl p-5">
              <p className="text-sm font-semibold">Precio al por mayor</p>
              {!signedIn ? (
                <p className="mt-1 text-sm text-muted"><Link to="/ingresar" state={{ from: `/producto/${product.slug}` }} className="font-medium text-brand-400 hover:underline">Ingresa o crea tu cuenta</Link> para ver el precio mayorista.</p>
              ) : (
                <>
                  <p className="price mt-1 text-2xl font-bold text-white">{formatCOP(wholesalePrice)}</p>
                  {canBuy ? (
                    <Button size="md" variant="outline" className="mt-3 w-full" disabled={soldOut} onClick={() => addToCart('wholesale')}>
                      {added === 'wholesale' ? <><Check className="size-4" aria-hidden />Agregado</> : 'Agregar al carrito (mayorista)'}
                    </Button>
                  ) : <p className="mt-1 text-sm text-muted">Compras a este precio después de tu primera compra entregada y pagada.</p>}
                </>
              )}
            </div>
          ) : null}

          <ul id="entrega" aria-label="Entrega y pago" className="mt-5 scroll-mt-40 space-y-2.5 border-t border-line pt-5 text-sm text-ink/85">
            {notes.map(({ icon: Icon, text }) => <li key={text} className="flex items-start gap-2.5"><Icon className="mt-0.5 size-4 shrink-0 text-mint-ink" aria-hidden />{text}</li>)}
          </ul>
        </div>
      </div>

      {/* Descripción y ficha técnica */}
      <Reveal className="mt-14 grid gap-6 lg:grid-cols-2">
        <section className="panel rounded-2xl p-6">
          <h2 className="section-title text-xl font-bold">Descripción</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/80">{product.description || 'Sin descripción.'}</p>
        </section>
        {specs.length || label ? (
          <section className="panel rounded-2xl p-6">
            <h2 className="section-title text-xl font-bold">Características</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[...(variant.capacity ? [['Capacidad', variant.capacity]] : []), ...(variant.color ? [['Color', variant.color]] : []), ...(variant.batteryHealth ? [['Batería', `${variant.batteryHealth}%`]] : []), ...(variant.simType ? [['SIM', SIM_LABEL[variant.simType]]] : []), ...specs.filter(([k]) => k !== 'Capacidad')]
                .map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-surface p-3 ring-1 ring-line"><dt className="text-xs text-muted">{k}</dt><dd className="mt-0.5 font-semibold text-white">{v}</dd></div>
                ))}
            </dl>
          </section>
        ) : null}
      </Reveal>

      <Reviews reviews={reviews ?? []} loading={loadingReviews} />

      {related.length ? (
        <section aria-labelledby="relacionados" className="mt-14">
          <h2 id="relacionados" className="section-title mb-6 text-2xl font-bold tracking-tight">También te puede interesar</h2>
          <ProductGrid products={related} />
        </section>
      ) : null}

      {/* Móvil: precio y botón siempre a la vista */}
      {showBuyBar ? (
        <div className="buy-bar flex items-center gap-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="price truncate text-lg font-extrabold text-white">{formatCOP(retailPrice! * amount)}</p>
            <p className="truncate text-xs text-muted">{label || product.name}</p>
          </div>
          <Button size="md" className="shrink-0" onClick={() => addToCart('retail')}>
            {added === 'retail' ? <><Check className="size-4" aria-hidden />Agregado</> : <><ShoppingBag className="size-4" aria-hidden />Agregar</>}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
