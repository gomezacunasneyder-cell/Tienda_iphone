import {
  addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp,
  Timestamp, updateDoc, where, type DocumentData,
} from 'firebase/firestore'
import { DEMO_MODE, db } from './firebase'
import { PREVIEW, hasRealPhoto } from '@/config/preview'
import { demoStore } from './demoData'
import type { Category, Product, ProductInput } from '@/types/domain'
import { productSchema } from '@/types/schemas'

const productsCol = collection(db, 'products')
const categoriesCol = collection(db, 'categories')

const toDate = (v: unknown): Date | null => (v instanceof Timestamp ? v.toDate() : null)

function toProduct(id: string, data: DocumentData): Product {
  return {
    id,
    slug: data.slug, name: data.name, brand: data.brand, kind: data.kind,
    condition: data.condition, categoryId: data.categoryId,
    description: data.description ?? '', images: data.images ?? [],
    specs: data.specs ?? {}, variants: data.variants ?? [],
    active: Boolean(data.active), featured: Boolean(data.featured),
    createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt),
  }
}

/** Catálogo público: solo productos activos (las reglas también lo imponen). */
export async function listPublicProducts(): Promise<Product[]> {
  if (DEMO_MODE) return demoStore.products(true).filter((p) => !PREVIEW.onlyRealPhotos || hasRealPhoto(p.images))
  const snap = await getDocs(query(productsCol, where('active', '==', true), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => toProduct(d.id, d.data()))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (DEMO_MODE) return demoStore.bySlug(slug)
  const snap = await getDocs(query(productsCol, where('slug', '==', slug), where('active', '==', true)))
  const first = snap.docs[0]
  return first ? toProduct(first.id, first.data()) : null
}

/** Panel interno: incluye inactivos. Requiere rol admin/seller según las reglas. */
export async function listAllProducts(): Promise<Product[]> {
  if (DEMO_MODE) return demoStore.products(false)
  const snap = await getDocs(query(productsCol, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => toProduct(d.id, d.data()))
}

export async function getProductById(id: string): Promise<Product | null> {
  if (DEMO_MODE) return demoStore.byId(id)
  const snap = await getDoc(doc(productsCol, id))
  return snap.exists() ? toProduct(snap.id, snap.data()) : null
}

/**
 * Los precios mayoristas NO se guardan en el documento público del producto (cualquiera podría leerlo).
 * En la etapa de Firebase irán en una colección aparte legible solo por usuarios registrados.
 */
const withoutWholesale = <T extends ProductInput>(d: T): T => ({ ...d, variants: d.variants.map(({ wholesalePrice: _w, ...v }) => v) })

export async function createProduct(input: ProductInput): Promise<string> {
  const data = productSchema.parse(input)
  if (DEMO_MODE) return demoStore.create(data)
  const ref = await addDoc(productsCol, { ...withoutWholesale(data), createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const data = productSchema.parse(input)
  if (DEMO_MODE) return demoStore.update(id, data)
  await updateDoc(doc(productsCol, id), { ...withoutWholesale(data), updatedAt: serverTimestamp() })
}

export async function listCategories(): Promise<Category[]> {
  if (DEMO_MODE) return demoStore.categories()
  const snap = await getDocs(query(categoriesCol, orderBy('order')))
  return snap.docs.map((d) => ({ id: d.id, slug: d.data().slug, name: d.data().name, order: d.data().order ?? 0 }))
}

export async function createCategory(name: string): Promise<void> {
  const clean = name.trim()
  const slug = clean.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!slug) throw new Error('Nombre no válido')
  if (DEMO_MODE) return demoStore.addCategory(clean)
  const existing = await getDocs(categoriesCol)
  await addDoc(categoriesCol, { name: clean, slug, order: existing.size + 1 })
}
