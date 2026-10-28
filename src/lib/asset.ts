/**
 * Ruta de un archivo de /public respetando la base de publicación (por ejemplo /Tienda_iphone/ en GitHub Pages).
 * Uso: asset('/brand/mark-96.webp'). Si la ruta ya es absoluta (http, data:, blob:) se devuelve igual.
 */
export const asset = (path: string): string =>
  /^(https?:|data:|blob:)/.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
