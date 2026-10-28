import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Vista previa pública en GitHub Pages (npm run build:vista): se publica en /Tienda_iphone/, sin PWA y sin indexar.
const PREVIEW_BASE = '/Tienda_iphone/'

export default defineConfig(({ mode }) => ({
  base: mode === 'vista' ? PREVIEW_BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'demo' ? [viteSingleFile()] : []),
    // La vista previa no debe aparecer en buscadores: la tienda real vivirá en su propio dominio.
    ...(mode === 'vista' ? [{
      name: 'noindex-vista',
      transformIndexHtml: () => [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' as const }],
    }] : []),
    // Sin service worker en la vista previa: bajo una subruta es una fuente clásica de caché obsoleta.
    ...(mode === 'demo' || mode === 'vista' ? [] : [VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-64.png', 'brand/mark-96.webp'],
      manifest: {
        name: 'CeluNorte',
        short_name: 'CeluNorte',
        description: 'Tecnología que te conecta. iPhone nuevos y usados, y accesorios en Cúcuta y todo Colombia.',
        lang: 'es-CO',
        theme_color: '#1d2026',
        background_color: '#1d2026',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Nunca cachear llamadas a Firebase/Auth: los datos privados no se guardan en el SW.
        navigateFallbackDenylist: [/^\/__\//],
        globPatterns: ['**/*.{js,css,html,svg,woff2,png,webp}'],
        // Los íconos de instalación los pide el sistema al instalar la app y las fuentes de otros alfabetos
        // solo se descargan si una página las usa: no hace falta guardarlos por adelantado en cada visita.
        globIgnores: ['icons/pwa-*.png', '**/inter-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    })]),
  ],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  // Librerías en archivos propios: cambian poco, así el navegador las conserva en caché entre publicaciones
  // aunque cambie el código de la tienda. En "demo" todo va en un solo archivo, así que no aplica.
  build: mode === 'demo' ? {} : {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/, priority: 20 },
            { name: 'firebase-sdk', test: /node_modules[\\/](@firebase|firebase)[\\/]/, priority: 15 },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
}))
