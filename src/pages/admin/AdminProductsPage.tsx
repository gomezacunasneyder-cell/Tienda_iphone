import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { buttonClasses } from '@/components/ui/Button'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States'
import { useAuth } from '@/features/auth/AuthContext'
import { conditionLabel, minRetail, minWholesale, totalStock } from '@/features/catalog/helpers'
import { formatCOP } from '@/lib/utils'
import { listAllProducts } from '@/services/productsRepo'

export default function AdminProductsPage() {
  const { role } = useAuth()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['products', 'all'], queryFn: listAllProducts })

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        {role === 'admin' ? <Link to="/admin/productos/nuevo" className={buttonClasses({ size: 'sm' })}><Plus className="size-4" aria-hidden />Nuevo</Link> : null}
      </div>

      <div className="mt-6">
        {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={() => void refetch()} />
          : !data?.length ? <EmptyState title="Aún no hay productos">Crea el primero con el botón “Nuevo”.</EmptyState>
          : (
            <div className="overflow-x-auto rounded-2xl border border-line-strong/70 bg-card">
              <table className="w-full min-w-[720px] text-left text-sm [&_td]:align-middle">
                <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
                  <tr><th className="px-4 py-3 font-medium">Producto</th><th className="px-4 py-3 font-medium">Estado</th><th className="px-4 py-3 text-right font-medium">Detal</th><th className="px-4 py-3 text-right font-medium">Mayorista</th><th className="px-4 py-3 text-right font-medium">Stock</th><th className="px-4 py-3 font-medium">Publicado</th><th className="px-4 py-3" /></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.map((p) => (
                    <tr key={p.id} className={p.active ? 'hover:bg-surface/70' : 'opacity-60 hover:bg-surface/70'}>
                      <td className="min-w-52 px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3">{conditionLabel(p.condition)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{minRetail(p) === null ? <Badge tone="warning">Por definir</Badge> : formatCOP(minRetail(p)!)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{minWholesale(p) === null ? '—' : formatCOP(minWholesale(p)!)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{totalStock(p) === 0 ? <Badge tone="danger">Agotado</Badge> : totalStock(p)}</td>
                      <td className="px-4 py-3">{p.active ? <Badge tone="success">Activo</Badge> : <Badge>Oculto</Badge>}</td>
                      <td className="px-4 py-3 text-right">{role === 'admin' ? <Link className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink hover:border-brand-600/70 hover:bg-surface" to={`/admin/productos/${p.id}`}>Editar</Link> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </>
  )
}
