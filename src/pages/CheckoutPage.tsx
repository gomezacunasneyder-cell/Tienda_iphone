import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, MapPin, MessageCircle, Package, Truck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { Fireworks } from '@/components/brand/Fireworks'
import { Button, buttonClasses } from '@/components/ui/Button'
import { TextArea, TextField } from '@/components/ui/Field'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/cart/CartContext'
import { OrderSummary } from '@/features/orders/OrderCard'
import { orderWhatsAppUrl } from '@/lib/whatsapp'
import { cn, formatCOP } from '@/lib/utils'
import { createOrder } from '@/services/ordersRepo'
import type { Order } from '@/types/domain'

const schema = z.object({
  customerName: z.string().trim().min(3, 'Escribe tu nombre completo'),
  phone: z.string().trim().regex(/^3\d{9}$/, 'Celular colombiano de 10 dígitos (ej. 3001234567)'),
  deliveryMethod: z.enum(['local', 'national', 'pickup']),
  city: z.string().trim(),
  address: z.string().trim(),
  notes: z.string().trim().max(300),
}).superRefine((v, ctx) => {
  if (v.deliveryMethod !== 'pickup') {
    if (!v.city) ctx.addIssue({ code: 'custom', path: ['city'], message: 'Indica la ciudad' })
    if (v.address.length < 5) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Indica la dirección' })
  }
})
type Values = z.infer<typeof schema>

const DELIVERY_OPTIONS = [
  { value: 'local', icon: Package, title: 'Domicilio en la ciudad', text: 'Precio por WhatsApp' },
  { value: 'national', icon: Truck, title: 'Envío nacional', text: 'Se consulta con la transportadora' },
  { value: 'pickup', icon: MapPin, title: 'Recoger en punto físico', text: 'Sin costo de envío' },
] as const

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, clear } = useCart()
  const [order, setOrder] = useState<Order>()
  const [error, setError] = useState<string>()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: '', phone: '', deliveryMethod: 'local', city: '', address: '', notes: '' },
  })
  const method = watch('deliveryMethod')

  if (order) {
    const wa = orderWhatsAppUrl(order)
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Fireworks />
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/30"><CheckCircle2 className="size-9 text-emerald-400" aria-hidden /></span>
          <h1 className="mt-4 text-2xl font-bold text-white">¡Pedido recibido!</h1>
          <p className="mt-3 text-sm text-muted">Tu referencia es</p>
          <p className="mt-1 inline-block rounded-xl bg-surface px-4 py-2 font-mono text-xl font-bold tracking-wider text-white ring-1 ring-line-strong">{order.ref}</p>
          <p className="mt-3 text-muted">Aún no está pagado ni confirmado: lo coordinamos contigo por WhatsApp.</p>
        </div>
        <div className="panel mt-8 rounded-2xl p-5"><OrderSummary order={order} /></div>
        {wa ? <a href={wa} target="_blank" rel="noreferrer" className={buttonClasses({ size: 'lg', className: 'mt-6 w-full' })}><MessageCircle className="size-5" aria-hidden />Enviar por WhatsApp</a>
          : <p className="mt-6 rounded-xl bg-surface p-4 text-sm text-muted">Configura <code>VITE_WHATSAPP_NUMBER</code> para habilitar el mensaje de WhatsApp.</p>}
        <Link to="/mis-pedidos" className={buttonClasses({ variant: 'outline', className: 'mt-3 w-full' })}>Ver mis pedidos</Link>
      </div>
    )
  }

  if (items.length === 0) return <Navigate to="/carrito" replace />

  const onSubmit = async (v: Values) => {
    setError(undefined)
    try {
      const created = await createOrder({ ...v, customerId: user!.uid, customerEmail: user!.email, items })
      clear()
      setOrder(created)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el pedido.')
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Finalizar pedido</h1>
          <p className="mt-1 text-sm text-muted">Tus datos para coordinar la entrega por WhatsApp.</p>
        </div>

        <section className="panel space-y-4 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-white">Tus datos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Nombre completo" autoComplete="name" error={errors.customerName?.message} {...register('customerName')} />
            <TextField label="Celular / WhatsApp" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
          </div>
        </section>

        <section className="panel space-y-4 rounded-2xl p-5 sm:p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-white">Entrega</legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              {DELIVERY_OPTIONS.map(({ value, icon: Icon, title, text }) => (
                <label key={value} className={cn('flex cursor-pointer items-start gap-3 rounded-2xl p-3.5 ring-1 transition', method === value ? 'bg-brand-600/10 ring-brand-500/60' : 'bg-white/[0.02] ring-line-strong hover:ring-white/25')}>
                  <input type="radio" value={value} {...register('deliveryMethod')} className="mt-1 size-4 shrink-0 accent-[#ff3b4b]" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-white"><Icon className="size-4 text-brand-500" aria-hidden />{title}</span>
                    <span className="mt-0.5 block text-xs text-muted">{text}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {method !== 'pickup' ? (
            <div className="grid gap-4 sm:grid-cols-[1fr_1.6fr]">
              <TextField label="Ciudad" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
              <TextField label="Dirección" autoComplete="street-address" error={errors.address?.message} {...register('address')} />
            </div>
          ) : null}
          <TextArea label="Notas (opcional)" rows={3} error={errors.notes?.message} {...register('notes')} />
        </section>

        <p className="flex gap-3 rounded-2xl bg-[#25d366]/[0.07] p-4 text-sm text-ink/85 ring-1 ring-[#25d366]/25">
          <MessageCircle className="mt-0.5 size-5 shrink-0 text-[#25d366]" aria-hidden />
          Este pedido no es un pago. Coordinamos disponibilidad, pago y entrega contigo por WhatsApp.
        </p>
        {error ? <p role="alert" className="text-sm text-red-400">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creando pedido…' : 'Crear pedido'}</Button>
      </form>

      <aside className="panel h-fit rounded-2xl p-5 text-sm sm:p-6 lg:sticky lg:top-32">
        <h2 className="text-lg font-semibold text-white">Resumen</h2>
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={i.variantId} className="flex items-center gap-3">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-surface ring-1 ring-line">
                {i.image ? <img src={i.image} alt="" loading="lazy" className="size-full object-contain" /> : null}
                <span className="absolute -right-0 -top-0 grid min-w-5 place-items-center rounded-bl-lg bg-raised px-1 text-[10px] font-semibold text-white">{i.qty}</span>
              </span>
              <span className="min-w-0 flex-1"><span className="line-clamp-2 text-ink">{i.name}</span>{i.variantLabel ? <span className="block truncate text-xs text-muted">{i.variantLabel}</span> : null}</span>
              <span className="price shrink-0 font-medium text-white">{formatCOP(i.unitPrice * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="price font-semibold text-white">{formatCOP(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd>A convenir por WhatsApp</dd></div>
        </dl>
      </aside>
    </div>
  )
}
