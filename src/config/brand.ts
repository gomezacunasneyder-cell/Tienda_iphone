import { asset } from '@/lib/asset'
export const BRAND = {
  name: 'CeluNorte',
  tagline: 'Tecnología que te conecta',
  city: 'Cúcuta, Colombia',
  pickup: 'Punto de entrega en Los Patios',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '',
  country: 'CO',
  currency: 'COP',
  /**
   * Mascota animada del banner principal (levanta el iPhone y se toma una selfie).
   * - sources: video sin sonido en /public, en orden de preferencia. Si ninguno funciona, se queda el póster.
   *   Se exporta ya recortado a la proporción `ratio` (540×720) para no descargar píxeles que no se ven;
   *   el original sin recortar está en /media-originales. Ver README → "Video del banner".
   * - poster: primer fotograma en WebP con el mismo recorte; se muestra mientras carga y con "reducir movimiento".
   * - fallback: imagen que se usa solo si el póster no está en /public.
   * - playback: 'scroll' = el video avanza al bajar y retrocede al subir; 'auto' = se reproduce solo.
   *   En 'scroll' el video debe exportarse con todos los cuadros como fotogramas clave (README); por eso solo
   *   hay MP4: un WebM así pesa el triple.
   * - loop: solo en 'auto'. true únicamente si el último fotograma enlaza con el primero.
   */
  mascot: {
    sources: [
      { src: asset('/videos/celunorte-selfie.mp4'), type: 'video/mp4' },
    ],
    poster: asset('/images/mascota-celunorte-poster.webp'),
    fallback: asset('/brand/mascota-crop.webp'),
    ratio: '3 / 4',
    playback: 'scroll',
    /** Cuadros por segundo del video exportado (en 'scroll' se muestra siempre un cuadro exacto). */
    fps: 24,
    loop: false,
  },
} as const
