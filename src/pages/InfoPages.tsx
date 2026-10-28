import { asset } from '@/lib/asset'
import { ArrowRight, BatteryCharging, Cable, Car, Headphones, HeartHandshake, Layers, Magnet, MapPin, MessageCircle, PackageCheck, Plug, Recycle, Shield, ShieldCheck, Smartphone, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { BRAND } from '@/config/brand'
import { cn } from '@/lib/utils'

function Shell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-lg text-muted">{intro}</p>
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  )
}

const card = 'rounded-2xl border border-line-strong/70 bg-card p-5'
const whatsapp = BRAND.whatsappNumber ? `https://wa.me/${BRAND.whatsappNumber}` : undefined

/** Todo lo que vende la tienda: iPhone y el universo de accesorios alrededor. */
const PRODUCT_LINES = [
  { icon: Smartphone, title: 'iPhone nuevos', text: 'Sellados en caja, últimos modelos y capacidades.', tone: 'bg-rose text-rose-ink', to: '/catalogo?seccion=nuevos' },
  { icon: Recycle, title: 'iPhone usados', text: 'Revisados, con IMEI legal y estado de batería a la vista.', tone: 'bg-sky text-sky-ink', to: '/catalogo?seccion=usados' },
  { icon: Shield, title: 'Forros y fundas', text: 'Silicona, transparentes, antigolpes y con MagSafe para cada modelo.', tone: 'bg-lilac text-lilac-ink' },
  { icon: Layers, title: 'Vidrios templados', text: 'Protectores de pantalla y de cámara para tu modelo.', tone: 'bg-mint text-mint-ink' },
  { icon: Plug, title: 'Cargadores', text: 'Adaptadores de carga rápida USB-C de 20 W en adelante.', tone: 'bg-peach text-peach-ink' },
  { icon: Cable, title: 'Cables', text: 'USB-C a Lightning y USB-C a USB-C, cortos y largos.', tone: 'bg-butter text-butter-ink' },
  { icon: Magnet, title: 'MagSafe e inalámbricos', text: 'Cargadores magnéticos, bases y baterías MagSafe.', tone: 'bg-rose text-rose-ink' },
  { icon: BatteryCharging, title: 'Power banks', text: 'Baterías portátiles para que no te quedes sin carga.', tone: 'bg-sky text-sky-ink' },
  { icon: Headphones, title: 'Audífonos', text: 'AirPods y audífonos compatibles, con estuche de carga.', tone: 'bg-lilac text-lilac-ink' },
  { icon: Car, title: 'Soportes y más', text: 'Soportes para carro, trípodes, adaptadores y más accesorios.', tone: 'bg-mint text-mint-ink' },
]

const VALUES = [
  { icon: ShieldCheck, title: 'Compra segura', text: 'Cada iPhone usado se revisa y se vende con IMEI legal verificado. Te decimos el estado real antes de que pagues.' },
  { icon: HeartHandshake, title: 'Asesoría honesta', text: 'Te ayudamos a elegir el equipo y los accesorios compatibles con tu modelo, sin venderte lo que no necesitas.' },
  { icon: Wallet, title: 'Pago contraentrega', text: 'Coordinamos el pago contigo. Un pedido no se considera pagado hasta que lo confirmamos juntos.' },
  { icon: PackageCheck, title: 'Envíos a todo Colombia', text: 'Domicilio en Cúcuta, punto de entrega en Los Patios o envío nacional bien empacado.' },
]

const STEPS = [
  'Elige tu iPhone o accesorio en el catálogo y agrégalo al carrito.',
  'Confirma el pedido: queda registrado con una referencia.',
  'Te escribimos por WhatsApp para confirmar disponibilidad y entrega.',
  'Recibes tu pedido y pagas contraentrega, como lo acordamos.',
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Presentación */}
      <section className="hero px-6 py-10 sm:px-10 md:py-14">
        <div className="grid items-center gap-8 md:grid-cols-[1.3fr_0.7fr]">
          <div className="animate-fade-up">
            <p className="eyebrow">Nosotros</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Todo para tu iPhone, <span className="text-gradient">en un solo lugar</span></h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              En <strong className="text-ink">{BRAND.name}</strong> somos una tienda de {BRAND.city} especializada en el mundo Apple. Vendemos iPhone nuevos y usados
              con IMEI legal y <strong className="text-ink">todo lo relacionado con tu iPhone</strong>: forros, vidrios templados, cargadores, cables, cargadores MagSafe,
              power banks, audífonos y más accesorios.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Nuestra idea es simple: que encuentres tu próximo iPhone y todo lo que necesitas para protegerlo y cargarlo, con atención cercana por WhatsApp y entregas en toda Colombia.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/catalogo" className={buttonClasses({ size: 'lg' })}>Ver catálogo<ArrowRight className="size-4" aria-hidden /></Link>
              {whatsapp ? <a href={whatsapp} target="_blank" rel="noreferrer" className={buttonClasses({ size: 'lg', variant: 'outline' })}><MessageCircle className="size-5" aria-hidden />Escríbenos</a>
                : <Link to="/contacto" className={buttonClasses({ size: 'lg', variant: 'outline' })}>Contáctanos</Link>}
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[280px]">
            <span aria-hidden className="mascot-halo" />
            <img src={asset("/brand/celunorte-logo.webp")} alt="Logo de CeluNorte" width={280} height={280} loading="lazy" className="relative size-full object-contain [mix-blend-mode:screen]" />
          </div>
        </div>
      </section>

      {/* Qué vendemos */}
      <section aria-labelledby="que-vendemos" className="mt-14">
        <Reveal>
          <h2 id="que-vendemos" className="section-title text-2xl font-bold tracking-tight sm:text-3xl">Lo que encuentras en {BRAND.name}</h2>
          <p className="mt-4 max-w-2xl text-muted">Además de iPhone, tenemos los accesorios que tu equipo necesita. Si no ves algo en el catálogo, pregúntanos y te contamos si lo tenemos.</p>
        </Reveal>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {PRODUCT_LINES.map(({ icon: Icon, title, text, tone, to }, i) => {
            const body = (
              <>
                <span className={cn('grid size-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110', tone)}><Icon className="size-6" aria-hidden /></span>
                <span className="mt-4 block font-semibold">{title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{text}</span>
              </>
            )
            const cls = 'panel group block h-full rounded-3xl p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-float)] sm:p-5'
            return (
              <Reveal as="li" key={title} delay={(i % 5) * 70}>
                {to ? <Link to={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>}
              </Reveal>
            )
          })}
        </ul>
      </section>

      {/* Por qué elegirnos */}
      <section aria-labelledby="por-que" className="mt-16">
        <Reveal><h2 id="por-que" className="section-title text-2xl font-bold tracking-tight sm:text-3xl">Por qué comprar con nosotros</h2></Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 80} className="panel flex gap-4 rounded-3xl p-6">
              <span className="perk-icon size-12 rounded-2xl"><Icon className="size-6" aria-hidden /></span>
              <div><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-relaxed text-muted">{text}</p></div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Cómo comprar */}
      <section aria-labelledby="como-comprar" className="mt-16">
        <Reveal><h2 id="como-comprar" className="section-title text-2xl font-bold tracking-tight sm:text-3xl">Así de fácil es comprar</h2></Reveal>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step} delay={i * 90} className="panel relative rounded-3xl p-5 pt-14">
              <span className="text-gradient absolute left-5 top-4 text-3xl font-extrabold">0{i + 1}</span>
              <p className="text-sm leading-relaxed">{step}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <Reveal className="hero mt-16 flex flex-col items-center gap-4 px-6 py-10 text-center sm:py-12">
        <p className="text-2xl font-bold tracking-tight sm:text-3xl">¿Buscas un iPhone o un accesorio?</p>
        <p className="max-w-xl text-muted">{BRAND.city}. {BRAND.pickup}. Envíos a todo Colombia.</p>
        <Link to="/catalogo" className={buttonClasses({ size: 'lg' })}>Explorar el catálogo<ArrowRight className="size-4" aria-hidden /></Link>
      </Reveal>
    </div>
  )
}

export function PaymentsPage() {
  const steps = [
    'Elige tus productos y agrégalos al carrito.',
    'Confirma el pedido en la tienda: queda registrado con una referencia.',
    'Te contactamos por WhatsApp con el resumen del pedido.',
    'Acordamos contigo disponibilidad, dirección, fecha y condiciones de pago.',
  ]
  return (
    <Shell title="Pagos" intro="Por ahora el método de pago es contraentrega, coordinado por WhatsApp.">
      <ol className={`${card} space-y-3 text-sm`}>
        {steps.map((s, i) => (
          <li key={s} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center step-num">{i + 1}</span>{s}</li>
        ))}
      </ol>
      <p className="text-sm text-muted">La tienda no recibe pagos en línea: un pedido no se considera pagado hasta que lo confirmamos contigo.</p>
    </Shell>
  )
}

export function ContactPage() {
  return (
    <Shell title="Contacto" intro="Escríbenos por WhatsApp y te respondemos.">
      <div className={`${card} space-y-4 text-sm`}>
        <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />{BRAND.city}. {BRAND.pickup}. Envíos a todo Colombia.</p>
        {whatsapp ? (
          <a href={whatsapp} target="_blank" rel="noreferrer" className={buttonClasses({ size: 'lg' })}><MessageCircle className="size-5" aria-hidden />Escribir por WhatsApp</a>
        ) : <p className="text-muted">Configura <code>VITE_WHATSAPP_NUMBER</code> para habilitar el botón de WhatsApp.</p>}
      </div>
    </Shell>
  )
}
