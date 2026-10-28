# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Video del banner

La mascota del banner se configura en `src/config/brand.ts` (`BRAND.mascot`) y se muestra con el componente
reutilizable `src/components/ui/StoryVideo.tsx`. Con `playback: 'scroll'` el video avanza al bajar y retrocede al
subir (la lógica del scroll está en `src/components/home/HeroBanner.tsx`); con `'auto'` se reproduce solo.

Para cambiar el video, expórtalo a `public/videos/` ya recortado a la proporción del marco (3:4) y sin audio, y
genera el póster con el mismo recorte. El original sin comprimir se guarda en `media-originales/` (fuera de
`public/`, no se publica).

Con un video vertical de 716×1280 (ajusta `crop=ancho:alto:x:y` si cambia el tamaño):

```sh
# Modo scroll: todos los cuadros como fotogramas clave (-g 1) para que retroceder no vaya a saltos (~1,4 MB)
ffmpeg -i original.mp4 -vf "crop=716:955:0:39,scale=540:720:flags=lanczos" -an -c:v libx264 -preset slow -crf 30 -g 1 -pix_fmt yuv420p -movflags +faststart public/videos/celunorte-selfie.mp4
# Modo auto: compresión normal (~480 KB); también se puede agregar un WebM con libvpx-vp9
ffmpeg -i original.mp4 -vf "crop=716:955:0:39,scale=540:720:flags=lanczos" -an -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart public/videos/celunorte-selfie.mp4
# Póster (primer fotograma)
ffmpeg -i original.mp4 -vf "crop=716:955:0:39,scale=540:720:flags=lanczos" -frames:v 1 -c:v libwebp -quality 78 public/images/mascota-celunorte-poster.webp
```
