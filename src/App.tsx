import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Spinner } from '@/components/ui/States'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { RequireRole } from '@/features/auth/RequireRole'
import HomePage from '@/pages/HomePage'

const AboutPage = lazy(() => import('@/pages/InfoPages').then((m) => ({ default: m.AboutPage })))
const PaymentsPage = lazy(() => import('@/pages/InfoPages').then((m) => ({ default: m.PaymentsPage })))
const ContactPage = lazy(() => import('@/pages/InfoPages').then((m) => ({ default: m.ContactPage })))
const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const MyOrdersPage = lazy(() => import('@/pages/MyOrdersPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminProductFormPage = lazy(() => import('@/pages/admin/AdminProductFormPage'))

const lazyEl = (el: React.ReactNode) => <Suspense fallback={<Spinner />}>{el}</Suspense>

const routes = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalogo', element: lazyEl(<CatalogPage />) },
      { path: 'producto/:slug', element: lazyEl(<ProductPage />) },
      { path: 'nosotros', element: lazyEl(<AboutPage />) },
      { path: 'pagos', element: lazyEl(<PaymentsPage />) },
      { path: 'contacto', element: lazyEl(<ContactPage />) },
      { path: 'ingresar', element: lazyEl(<LoginPage />) },
      { path: 'carrito', element: lazyEl(<CartPage />) },
      {
        element: <RequireAuth />,
        children: [
          { path: 'checkout', element: lazyEl(<CheckoutPage />) },
          { path: 'mis-pedidos', element: lazyEl(<MyOrdersPage />) },
        ],
      },
    ],
  },
  {
    element: <RequireRole allow={['admin', 'seller']} />,
    children: [
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="productos" replace /> },
          { path: 'productos', element: lazyEl(<AdminProductsPage />) },
          { path: 'pedidos', element: lazyEl(<AdminOrdersPage />) },
          {
            element: <RequireRole allow={['admin']} />,
            children: [
              { path: 'productos/nuevo', element: lazyEl(<AdminProductFormPage />) },
              { path: 'productos/:id', element: lazyEl(<AdminProductFormPage />) },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined
const router = createBrowserRouter(routes, { basename })

export default function App() {
  return <RouterProvider router={router} />
}
