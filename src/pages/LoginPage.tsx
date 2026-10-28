import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { useAuth } from '@/features/auth/AuthContext'
import { PUBLIC_PREVIEW } from '@/services/firebase'

const schema = z.object({ email: z.email('Correo no válido'), password: z.string().min(6, 'Mínimo 6 caracteres') })
type Values = z.infer<typeof schema>

export default function LoginPage() {
  const { user, role, signIn, demoSignIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string>()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to={role ? '/admin' : ((location.state as { from?: string } | null)?.from ?? '/')} replace />

  const onSubmit = async (v: Values) => {
    setError(undefined)
    try {
      await signIn(v.email, v.password)
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
    } catch {
      setError('Correo o contraseña incorrectos.')
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Ingresar</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <TextField label="Correo" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <TextField label="Contraseña" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        {error ? <p role="alert" className="text-sm text-red-400">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Ingresando…' : 'Ingresar'}</Button>
      </form>
      {demoSignIn ? (
        <div className="mt-8 space-y-3 rounded-card border border-dashed border-brand-600 bg-brand-600/10 p-4">
          <p className="text-sm font-medium text-brand-400">{PUBLIC_PREVIEW ? 'Vista previa' : 'Modo demostración (solo desarrollo local)'}</p>
          <p className="text-xs text-muted">{PUBLIC_PREVIEW ? 'Entra sin contraseña con una cuenta de cliente de prueba.' : 'Entra sin contraseña para probar el panel con datos de prueba.'}</p>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_PREVIEW ? null : <>
              <Button size="sm" onClick={() => demoSignIn('admin')}>Entrar como administrador</Button>
              <Button size="sm" variant="outline" onClick={() => demoSignIn('seller')}>Entrar como vendedor</Button>
            </>}
            <Button size="sm" variant="outline" onClick={() => demoSignIn('customer')}>Entrar como cliente (con compras)</Button>
            <Button size="sm" variant="outline" onClick={() => demoSignIn('newcustomer')}>Entrar como cliente nuevo</Button>
          </div>
        </div>
      ) : null}
      <p className="mt-6 text-xs text-muted">El registro de clientes y la recuperación de contraseña se agregan en la etapa de cuentas.</p>
    </div>
  )
}
