import type { Product, SimType } from '@/types/domain'
import { phoneImg } from './demoImages'

/**
 * Inventario de usados según la lista de disponibilidad del 19-10-2026 (precios al por mayor).
 * El precio al detal queda en 0 = por definir: lo escribe el administrador unidad por unidad.
 * Los nombres de color salen de los emojis de la lista; "Gris" es el 🩶 y debe confirmarse (grafito / plata / titanio).
 */
const COLOR: Record<string, [string, string]> = {
  '🖤': ['Negro', '#1f2937'], '🤍': ['Blanco', '#e5e7eb'], '🩶': ['Gris', '#6b7280'], '💜': ['Morado', '#a78bfa'],
  '💙': ['Azul', '#60a5fa'], '💚': ['Verde', '#3f6b52'], '💛': ['Amarillo', '#fcd34d'], '❤️': ['Rojo', '#dc2626'],
}

type Unit = [emoji: string, battery: number, sim: SimType | undefined, wholesale: number, note?: string]
interface Row { model: string; cap: number; pro: boolean; units: Unit[] }

const E: SimType = 'esim'
const P: SimType = 'physical'

const rows: Row[] = [
  { model: '16 Pro Max', cap: 256, pro: true, units: [['🖤', 88, E, 2_650_000]] },
  { model: '16', cap: 128, pro: false, units: [['🤍', 87, P, 1_880_000]] },
  { model: '15 Pro', cap: 128, pro: true, units: [['🩶', 100, P, 2_150_000]] },
  { model: '15', cap: 128, pro: false, units: [['🖤', 92, P, 1_600_000]] },
  { model: '14 Pro Max', cap: 256, pro: true, units: [['🖤', 100, P, 2_100_000], ['🩶', 100, E, 2_000_000]] },
  { model: '14 Pro Max', cap: 128, pro: true, units: [['💜', 95, E, 2_000_000]] },
  { model: '14', cap: 128, pro: false, units: [['💙', 84, P, 1_250_000]] },
  { model: '13 Pro Max', cap: 256, pro: true, units: [['🩶', 84, undefined, 1_650_000], ['💚', 100, undefined, 1_650_000]] },
  { model: '13 Pro Max', cap: 128, pro: true, units: [['💚', 100, undefined, 1_600_000]] },
  { model: '13 Pro', cap: 128, pro: true, units: [['💛', 100, undefined, 1_200_000]] },
  { model: '13', cap: 128, pro: false, units: [['🤍', 100, undefined, 1_030_000], ['🖤', 87, undefined, 1_030_000]] },
  { model: '12', cap: 64, pro: false, units: [['❤️', 100, undefined, 800_000, 'Batería de segunda mano original (no es la de fábrica).']] },
  { model: '11', cap: 128, pro: false, units: [['🤍', 83, undefined, 680_000]] },
]

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-')

export function listaUsados(now: number): Product[] {
  return rows.map((r, i) => {
    const colors = r.units.map(([emoji]) => COLOR[emoji] ?? ['—', '#9ca3af'] as [string, string])
    return {
      id: `lista-${i + 1}`,
      slug: `iphone-${slugify(r.model)}-${r.cap}gb-usado`,
      name: `iPhone ${r.model} ${r.cap} GB`,
      brand: 'Apple', kind: 'iphone', condition: 'used', categoryId: 'cat-iphone',
      description: 'Equipo usado con IMEI legal. Revisado y probado antes de la entrega.',
      images: colors.map(([, hex]) => phoneImg(hex, true, true, r.pro)),
      specs: { Capacidad: `${r.cap} GB`, Estado: 'Usado', Origen: 'Lista de disponibilidad 19-10-2026' },
      variants: r.units.map(([emoji, battery, sim, wholesale, note], j) => ({
        id: `u${j + 1}`, sku: `L1019-${String(i + 1).padStart(2, '0')}-${j + 1}`,
        capacity: `${r.cap} GB`, color: COLOR[emoji]?.[0], batteryHealth: battery, simType: sim, note,
        price: 0, wholesalePrice: wholesale, stock: 1,
      })),
      active: true, featured: false,
      createdAt: new Date(now - (20 + i) * 3_600_000), updatedAt: null,
    }
  })
}
