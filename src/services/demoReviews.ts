import type { Product, Review } from '@/types/domain'

/**
 * Opiniones DE EJEMPLO para la vista previa (no son clientes reales). La página las rotula como ejemplo.
 * Se eligen de forma estable según el producto, para que no cambien al recargar.
 */
const IPHONE: Omit<Review, 'id' | 'productId' | 'createdAt'>[] = [
  { author: 'Laura M.', city: 'Cúcuta', rating: 5, verified: true, text: 'El equipo llegó tal cual lo describieron, la batería en el porcentaje que decía. Me lo entregaron en Los Patios el mismo día.' },
  { author: 'Andrés P.', city: 'Bucaramanga', rating: 5, verified: true, text: 'Me enviaron fotos y video del equipo antes de pagar. El envío nacional llegó en dos días y bien empacado.' },
  { author: 'Valentina R.', city: 'Cúcuta', rating: 4, verified: true, text: 'Muy buen estado, solo un detalle mínimo en el marco que ya me habían avisado. La atención por WhatsApp fue rápida.' },
  { author: 'Jhon F.', city: 'Villa del Rosario', rating: 5, verified: true, text: 'Verifiqué el IMEI y todo legal. Funciona perfecto, Face ID y cámaras al 100.' },
  { author: 'Camila G.', city: 'Pamplona', rating: 5, verified: true, text: 'Pagué contraentrega y me dio mucha confianza. Le compré también el forro y el vidrio templado.' },
  { author: 'Sergio T.', city: 'Cúcuta', rating: 4, verified: true, text: 'Buen precio comparado con otras tiendas. Tardaron un poco en responder un domingo, pero cumplieron.' },
]
const ACCESSORY: Omit<Review, 'id' | 'productId' | 'createdAt'>[] = [
  { author: 'Paola D.', city: 'Cúcuta', rating: 5, verified: true, text: 'Carga rápido y no se calienta. Lo pedí junto con el cable y llegó todo bien.' },
  { author: 'Miguel A.', city: 'Los Patios', rating: 4, verified: true, text: 'Buena calidad por el precio. El forro ajusta perfecto y protege la cámara.' },
  { author: 'Daniela S.', city: 'Ocaña', rating: 5, verified: true, text: 'Original y bien empacado. Me asesoraron sobre cuál era compatible con mi iPhone.' },
]

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
const DAY = 86_400_000

export function demoReviewsFor(product: Product): Review[] {
  const pool = product.kind === 'iphone' ? IPHONE : ACCESSORY
  const h = hash(product.id)
  const count = 3 + (h % (pool.length - 2))
  const labels = product.variants.map((v) => [v.capacity, v.color].filter(Boolean).join(' · ')).filter(Boolean)
  return Array.from({ length: count }, (_, i) => {
    const r = pool[(h + i) % pool.length]!
    return { ...r, id: `${product.id}-r${i}`, productId: product.id, variantLabel: labels[(h + i) % (labels.length || 1)], createdAt: new Date(Date.now() - (i * 9 + (h % 7) + 2) * DAY) }
  })
}
