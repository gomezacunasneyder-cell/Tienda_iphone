import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SelectField, TextArea, TextField } from '@/components/ui/Field'
import { ErrorState, Spinner } from '@/components/ui/States'
import { useCategories } from '@/hooks/useCatalog'
import { createCategory, createProduct, getProductById, updateProduct } from '@/services/productsRepo'
import { uploadProductImage } from '@/services/storageRepo'
import { productSchema, type ProductFormValues } from '@/types/schemas'

const empty: ProductFormValues = {
  slug: '', name: '', brand: 'Apple', kind: 'iphone', condition: 'new', categoryId: '', description: '',
  images: [], specs: {}, active: false, featured: false,
  variants: [{ id: crypto.randomUUID(), sku: '', price: 0, stock: 1 }],
}

const specsToText = (s: Record<string, string>) => Object.entries(s).map(([k, v]) => `${k}: ${v}`).join('\n')
const textToSpecs = (t: string): Record<string, string> =>
  Object.fromEntries(t.split('\n').map((l) => l.split(/:(.*)/s)).filter(([k, v]) => k?.trim() && v?.trim()).map(([k, v]) => [k!.trim(), v!.trim()]))

const num = (v: unknown) => (v === '' || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v))

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: categories, refetch: refetchCategories } = useCategories()
  const existing = useQuery({ queryKey: ['product-admin', id], queryFn: () => getProductById(id!), enabled: Boolean(id) })
  const [newCategory, setNewCategory] = useState('')
  const [uploadError, setUploadError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<ProductFormValues>({ resolver: zodResolver(productSchema), defaultValues: empty })
  const variants = useFieldArray({ control, name: 'variants' })
  const images = watch('images')

  useEffect(() => {
    if (existing.data) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = existing.data
      reset(rest)
    }
  }, [existing.data, reset])

  const save = useMutation({
    mutationFn: async (values: ProductFormValues) => (id ? updateProduct(id, values) : void (await createProduct(values))),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      navigate('/admin/productos')
    },
    onError: () => setSubmitError('No se pudo guardar. Verifica tus permisos y vuelve a intentar.'),
  })

  const onFiles = async (files: FileList | null) => {
    setUploadError(undefined)
    const slug = watch('slug')
    if (!slug) return setUploadError('Define primero el slug del producto.')
    try {
      const urls = await Promise.all(Array.from(files ?? []).map((f) => uploadProductImage(slug, f)))
      setValue('images', [...images, ...urls].slice(0, 8), { shouldDirty: true })
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'No se pudo subir la imagen.')
    }
  }

  if (id && existing.isLoading) return <Spinner />
  if (id && (existing.isError || !existing.data)) return <ErrorState message="No se encontró el producto." />

  return (
    <form onSubmit={handleSubmit((v) => { setSubmitError(undefined); save.mutate(v) })} className="mx-auto max-w-3xl space-y-8" noValidate>
      <h1 className="text-2xl font-semibold tracking-tight">{id ? 'Editar producto' : 'Nuevo producto'}</h1>

      <section className="grid gap-4 rounded-card border border-line bg-card p-5 sm:grid-cols-2">
        <TextField label="Nombre" error={errors.name?.message} {...register('name')} />
        <TextField label="Slug (URL)" hint="ej. iphone-15-pro-256" error={errors.slug?.message} {...register('slug')} />
        <TextField label="Marca" error={errors.brand?.message} {...register('brand')} />
        <SelectField label="Tipo" {...register('kind')}><option value="iphone">iPhone / móvil</option><option value="accessory">Accesorio</option></SelectField>
        <SelectField label="Condición" {...register('condition')}><option value="new">Nuevo</option><option value="used">Usado (IMEI legal)</option></SelectField>
        <div>
          <SelectField label="Categoría" error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">Seleccionar…</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
          <div className="mt-2 flex gap-2">
            <input aria-label="Nueva categoría" placeholder="Nueva categoría" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="h-9 flex-1 rounded-xl border border-line px-3 text-sm" />
            <Button size="sm" variant="outline" disabled={!newCategory.trim()} onClick={async () => { await createCategory(newCategory); setNewCategory(''); await refetchCategories() }}>Crear</Button>
          </div>
        </div>
        <div className="sm:col-span-2"><TextArea label="Descripción" error={errors.description?.message} {...register('description')} /></div>
        <div className="sm:col-span-2">
          <Controller control={control} name="specs" render={({ field }) => (
            <TextArea label="Especificaciones" hint="Una por línea, formato «Clave: valor»" defaultValue={specsToText(field.value)} key={existing.data?.id ?? 'new'} onChange={(e) => field.onChange(textToSpecs(e.target.value))} />
          )} />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('active')} className="size-4 accent-brand-600" />Publicado en la tienda</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('featured')} className="size-4 accent-brand-600" />Destacado en inicio</label>
      </section>

      <section className="space-y-4 rounded-card border border-line bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Variantes</h2>
          <Button size="sm" variant="outline" onClick={() => variants.append({ id: crypto.randomUUID(), sku: '', price: 0, stock: 1 })}><Plus className="size-4" aria-hidden />Agregar</Button>
        </div>
        {errors.variants?.message ? <p role="alert" className="text-xs text-red-400">{errors.variants.message}</p> : null}
        {variants.fields.map((f, i) => (
          <div key={f.id} className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-3">
            <TextField label="SKU" error={errors.variants?.[i]?.sku?.message} {...register(`variants.${i}.sku`)} />
            <TextField label="Capacidad" placeholder="128 GB" {...register(`variants.${i}.capacity`)} />
            <TextField label="Color" {...register(`variants.${i}.color`)} />
            <TextField label="Precio al detal (COP)" hint="0 = por definir" type="number" inputMode="numeric" min={0} error={errors.variants?.[i]?.price?.message} {...register(`variants.${i}.price`, { valueAsNumber: true })} />
            <TextField label="Precio anterior" type="number" inputMode="numeric" min={0} {...register(`variants.${i}.compareAtPrice`, { setValueAs: num })} />
            <TextField label="Stock" type="number" inputMode="numeric" min={0} error={errors.variants?.[i]?.stock?.message} {...register(`variants.${i}.stock`, { valueAsNumber: true })} />
            <TextField label="Batería % (usados)" type="number" inputMode="numeric" min={1} max={100} {...register(`variants.${i}.batteryHealth`, { setValueAs: num })} />
            <TextField label="Precio mayorista" type="number" inputMode="numeric" min={0} hint="Vacío = no se vende al por mayor" {...register(`variants.${i}.wholesalePrice`, { setValueAs: num })} />
            <SelectField label="Tipo de SIM" {...register(`variants.${i}.simType`, { setValueAs: (v: string) => v || undefined })}>
              <option value="">No aplica</option><option value="esim">eSIM</option><option value="physical">SIM física</option><option value="both">eSIM + SIM física</option>
            </SelectField>
            <div className="sm:col-span-3"><TextField label="Nota para el cliente (opcional)" placeholder="Ej. Batería de segunda mano original" {...register(`variants.${i}.note`, { setValueAs: (v: string) => v?.trim() || undefined })} /></div>
            <div className="flex items-end"><Button variant="ghost" size="sm" disabled={variants.fields.length === 1} onClick={() => variants.remove(i)}><Trash2 className="size-4" aria-hidden />Quitar</Button></div>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-card border border-line bg-card p-5">
        <h2 className="font-semibold">Imágenes</h2>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="Subir imágenes" onChange={(e) => void onFiles(e.target.files)} className="text-sm" />
        {uploadError ? <p role="alert" className="text-xs text-red-400">{uploadError}</p> : null}
        <ul className="flex flex-wrap gap-3">
          {images.map((src) => (
            <li key={src} className="relative size-20 overflow-hidden rounded-xl border border-line bg-surface">
              <img src={src} alt="" className="size-full object-contain" />
              <button type="button" aria-label="Quitar imagen" onClick={() => setValue('images', images.filter((s) => s !== src), { shouldDirty: true })} className="absolute right-1 top-1 rounded-full bg-card/90 p-0.5"><X className="size-3" aria-hidden /></button>
            </li>
          ))}
        </ul>
      </section>

      {submitError ? <p role="alert" className="text-sm text-red-400">{submitError}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || save.isPending}>{save.isPending ? 'Guardando…' : 'Guardar'}</Button>
        <Button variant="outline" onClick={() => navigate('/admin/productos')}>Cancelar</Button>
      </div>
    </form>
  )
}
