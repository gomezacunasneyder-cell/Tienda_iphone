import { z } from 'zod'

export const variantSchema = z.object({
  id: z.string().min(1),
  sku: z.string().trim().min(1, 'Requerido'),
  capacity: z.string().trim().optional(),
  color: z.string().trim().optional(),
  batteryHealth: z.number().int().min(1).max(100).optional(),
  price: z.number().int('Sin decimales').min(0, 'No puede ser negativo'),
  wholesalePrice: z.number().int().positive().optional(),
  simType: z.enum(['esim', 'physical', 'both']).optional(),
  note: z.string().trim().max(160).optional(),
  compareAtPrice: z.number().int().positive().optional(),
  stock: z.number().int().min(0, 'No puede ser negativo'),
})

export const productSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones'),
  name: z.string().trim().min(3, 'Mínimo 3 caracteres'),
  brand: z.string().trim().min(1, 'Requerido'),
  kind: z.enum(['iphone', 'accessory']),
  condition: z.enum(['new', 'used']),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().trim().min(10, 'Describe el producto'),
  images: z.array(z.url()).max(8),
  specs: z.record(z.string(), z.string()),
  variants: z.array(variantSchema).min(1, 'Agrega al menos una variante'),
  active: z.boolean(),
  featured: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productSchema>
