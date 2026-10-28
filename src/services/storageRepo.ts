import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { DEMO_MODE, storage } from './firebase'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadProductImage(productSlug: string, file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error('Formato no permitido. Usa JPG, PNG o WebP.')
  if (file.size > MAX_BYTES) throw new Error('La imagen supera 5 MB.')
  if (DEMO_MODE) return URL.createObjectURL(file)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const r = ref(storage, `products/${productSlug}/${Date.now()}-${safeName}`)
  await uploadBytes(r, file, { contentType: file.type })
  return getDownloadURL(r)
}
