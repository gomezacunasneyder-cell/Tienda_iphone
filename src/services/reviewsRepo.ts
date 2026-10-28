import { collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore'
import { DEMO_MODE, db } from './firebase'
import { demoReviewsFor } from './demoReviews'
import type { Product, Review } from '@/types/domain'

/** Opiniones publicadas de un producto, las más recientes primero. */
export async function listReviews(product: Product): Promise<Review[]> {
  if (DEMO_MODE) return demoReviewsFor(product)
  const snap = await getDocs(query(collection(db, 'reviews'), where('productId', '==', product.id), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => {
    const x = d.data()
    return {
      id: d.id, productId: x.productId, author: x.author ?? 'Cliente', city: x.city, rating: Number(x.rating) || 0, text: x.text ?? '',
      variantLabel: x.variantLabel, verified: Boolean(x.verified), createdAt: x.createdAt instanceof Timestamp ? x.createdAt.toDate() : new Date(),
    }
  })
}
