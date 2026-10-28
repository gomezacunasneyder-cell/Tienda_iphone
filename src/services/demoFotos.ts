import { asset } from '@/lib/asset'
import type { Product } from '@/types/domain'

/**
 * Productos armados con las FOTOS REALES del inventario. Los textos de modelo, capacidad, batería y SIM salen
 * de lo que dice cada foto. Los PRECIOS Y UNIDADES SON DE PRUEBA (aún no hay precios confirmados para estos equipos).
 */
interface F {
  slug: string; name: string; condition: 'new' | 'used'; images: string[]; capacity: string
  /** Colores que se ven en la foto: una unidad de prueba por color. */
  colors: string[]
  battery?: number; sim?: 'esim' | 'physical' | 'both'; price: number; wholesale?: number
}

const fotos: F[] = [
  { slug: '17-256-azul', name: 'iPhone 17 256 GB (azul)', condition: 'used', images: [asset('/fotos/17-256-azul.jpg')], capacity: '256 GB', colors: ['Azul'], battery: 100, sim: 'both', price: 3_400_000 },
  { slug: '17-256-colores', name: 'iPhone 17 256 GB (varios colores)', condition: 'used', images: [asset('/fotos/17-256-colores.jpg')], capacity: '256 GB', colors: ['Blanco', 'Negro', 'Azul', 'Lavanda'], battery: 98, sim: 'esim', price: 3_300_000 },
  { slug: '13-pro-max-256-fotos', name: 'iPhone 13 Pro Max 256 GB', condition: 'used', images: [asset('/fotos/13promax-256.jpg')], capacity: '256 GB', colors: ['Azul sierra', 'Plata', 'Grafito'], battery: 100, price: 2_100_000 },
  { slug: '15-128-negros', name: 'iPhone 15 128 GB (negros)', condition: 'used', images: [asset('/fotos/15-128-negros.jpg')], capacity: '128 GB', colors: ['Negro'], battery: 98, sim: 'physical', price: 2_000_000 },
  { slug: '15-128-colores', name: 'iPhone 15 128 GB (varios colores)', condition: 'used', images: [asset('/fotos/15-128-colores.jpg')], capacity: '128 GB', colors: ['Negro', 'Azul', 'Rosa'], battery: 100, sim: 'physical', price: 2_100_000 },
  { slug: '16-128-rosa', name: 'iPhone 16 128 GB (rosa)', condition: 'used', images: [asset('/fotos/16-128-rosa.jpg')], capacity: '128 GB', colors: ['Rosa'], battery: 91, sim: 'physical', price: 2_300_000 },
  { slug: '13-128-fotos', name: 'iPhone 13 128 GB (verde y blanco)', condition: 'used', images: [asset('/fotos/13-128.jpg')], capacity: '128 GB', colors: ['Verde', 'Blanco'], battery: 100, price: 1_400_000 },
  { slug: '18-pro-max-256', name: 'iPhone 18 Pro Max 256 GB', condition: 'new', images: [asset('/fotos/18promax-256-cajas.jpg')], capacity: '256 GB', colors: ['Azul', 'Plata'], sim: 'esim', price: 6_000_000 },
]

export function productosConFotos(now: number): Product[] {
  return fotos.map((f, i) => ({
    id: `foto-${i + 1}`, slug: `${f.slug}-prueba`, name: `${f.name} · PRUEBA`,
    brand: 'Apple', kind: 'iphone', condition: f.condition, categoryId: 'cat-iphone',
    description: `Foto real del inventario. PRECIO Y UNIDADES DE PRUEBA: aún no hay precio confirmado para este equipo.${f.condition === 'used' ? ' Equipo usado con IMEI legal.' : ''}`,
    images: f.images, specs: { Capacidad: f.capacity, Estado: f.condition === 'new' ? 'Nuevo' : 'Usado' },
    variants: f.colors.map((color, c) => ({
      id: `u${c + 1}`, sku: `FOTO-${String(i + 1).padStart(2, '0')}-${c + 1}`, capacity: f.capacity, color, batteryHealth: f.battery, simType: f.sim,
      price: f.price, wholesalePrice: f.wholesale, stock: 3,
    })),
    active: true, featured: i < 4, createdAt: new Date(now - (i + 1) * 1_800_000), updatedAt: null,
  }))
}
