import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** Los precios se guardan como enteros en COP (sin decimales) para evitar errores de coma flotante. */
export function formatCOP(value: number): string {
  return copFormatter.format(value)
}
