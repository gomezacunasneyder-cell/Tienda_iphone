import { useQuery } from '@tanstack/react-query'
import { getProductBySlug, listCategories, listPublicProducts } from '@/services/productsRepo'
import { listReviews } from '@/services/reviewsRepo'
import type { Product } from '@/types/domain'

export const useProducts = () => useQuery({ queryKey: ['products', 'public'], queryFn: listPublicProducts, staleTime: 60_000 })
export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: listCategories, staleTime: 5 * 60_000 })
export const useProduct = (slug: string | undefined) =>
  useQuery({ queryKey: ['product', slug], queryFn: () => getProductBySlug(slug!), enabled: Boolean(slug) })

export const useReviews = (product: Product | null | undefined) =>
  useQuery({ queryKey: ['reviews', product?.id], queryFn: () => listReviews(product!), enabled: Boolean(product), staleTime: 5 * 60_000 })
