import type { Product, ProductVariant, SimType } from '@/types/domain'

const positive = (n: number | undefined): n is number => typeof n === 'number' && n > 0

export const minRetail = (p: Product): number | null => {
  const prices = p.variants.map((v) => v.price).filter(positive)
  return prices.length ? Math.min(...prices) : null
}
export const minWholesale = (p: Product): number | null => {
  const prices = p.variants.map((v) => v.wholesalePrice).filter(positive)
  return prices.length ? Math.min(...prices) : null
}
export const hasRetail = (p: Product): boolean => minRetail(p) !== null
export const hasWholesale = (p: Product): boolean => minWholesale(p) !== null
export const totalStock = (p: Product): number => p.variants.reduce((n, v) => n + v.stock, 0)
export const conditionLabel = (c: Product['condition']): string => (c === 'new' ? 'Nuevo' : 'Usado')

export const SIM_LABEL: Record<SimType, string> = { esim: 'eSIM', physical: 'SIM física', both: 'eSIM + SIM física' }

/** Texto corto que distingue una unidad/variante de otra. */
export function variantLabel(v: ProductVariant): string {
  return [v.capacity, v.color, v.simType ? SIM_LABEL[v.simType] : undefined, v.batteryHealth ? `Batería ${v.batteryHealth}%` : undefined]
    .filter(Boolean)
    .join(' · ')
}

export type Section = 'nuevos' | 'usados' | 'mayoristas' | 'accesorios'
export const SECTION_LABEL: Record<Section, string> = { nuevos: 'Nuevos', usados: 'Usados', mayoristas: 'Mayoristas', accesorios: 'Accesorios' }

export function inSection(p: Product, section: Section | ''): boolean {
  switch (section) {
    case 'nuevos': return p.kind === 'iphone' && p.condition === 'new' && hasRetail(p)
    case 'usados': return p.kind === 'iphone' && p.condition === 'used' && hasRetail(p)
    case 'mayoristas': return hasWholesale(p)
    case 'accesorios': return p.kind === 'accessory' && hasRetail(p)
    default: return hasRetail(p)
  }
}
