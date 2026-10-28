import { asset } from '@/lib/asset'
import type { Ref } from 'react'
import { Camera } from 'lucide-react'
import { StoryVideo, type StoryVideoHandle } from '@/components/ui/StoryVideo'
import { BRAND } from '@/config/brand'
import { cn } from '@/lib/utils'

/**
 * Mascota de CeluNorte en el banner: levanta el iPhone y se toma una selfie. Los archivos se configuran en `BRAND.mascot`.
 * Con `playback: 'scroll'`, quien la usa la mueve con `handle.seek()` (ver HeroBanner).
 */
export function Mascot({ className, handle }: { className?: string; handle?: Ref<StoryVideoHandle> }) {
  const { sources, poster, fallback, ratio, loop, playback, fps } = BRAND.mascot
  return (
    <StoryVideo
      sources={sources} poster={poster} fallback={fallback} ratio={ratio} loop={loop} playback={playback} fps={fps} handle={handle}
      alt="Mascota de CeluNorte tomándose una selfie con su iPhone"
      caption={<><img src={asset("/brand/mark-96.webp")} alt="" width={20} height={20} className="size-5 rounded-full" />@{BRAND.name.toLowerCase()}</>}
      className={cn('mascot', className)}
    >
      <span aria-hidden className="mascot-halo" />
      <span aria-hidden className="mascot-chip mascot-chip-a"><Camera className="size-3.5" />¡Selfie con su iPhone!</span>
      <span aria-hidden className="mascot-chip mascot-chip-b"><span className="mascot-live" />Nuevos y usados</span>
    </StoryVideo>
  )
}
