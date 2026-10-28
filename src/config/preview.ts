/** Interruptores de la vista previa. Para volver al comportamiento completo, pon ambos en su valor contrario. */
export const PREVIEW = {
  /** true = el catálogo público muestra solo productos con foto real (oculta los de ilustración). */
  onlyRealPhotos: true,
  /** false = las tarjetas del catálogo no abren la ficha del producto. */
  cardsLinkToProduct: true,
} as const

export const hasRealPhoto = (images: string[]): boolean => images.some((src) => !src.startsWith('data:'))
