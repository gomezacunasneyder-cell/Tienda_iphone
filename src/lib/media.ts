/** Fuente de un video: el navegador usa la primera que pueda reproducir (WebM primero, MP4 de respaldo). */
export interface VideoSource { src: string; type: string }

type NetworkInfo = { saveData?: boolean; effectiveType?: string }

/**
 * Un video solo se descarga si aporta algo: no con "reducir movimiento" ni con ahorro de datos o red 2G.
 * En esos casos se queda la imagen fija.
 */
export function shouldAutoplayMedia(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection
    return !(conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? ''))
  } catch {
    return false
  }
}
