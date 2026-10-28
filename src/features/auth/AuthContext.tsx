import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { DEMO_CUSTOMER } from '@/services/demoData'
import { DEMO_MODE, PUBLIC_PREVIEW, auth } from '@/services/firebase'
import type { Role } from '@/types/domain'

export interface AppUser { uid: string; email: string | null }

interface AuthState {
  user: AppUser | null
  role: Role | null
  /** Cliente con precio mayorista habilitado (claim asignado por el servidor). */
  wholesale: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** Solo existe en modo demostración (desarrollo local sin Firebase). */
  demoSignIn?: (role: Role | 'customer' | 'newcustomer') => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/** El rol viene de un custom claim asignado en el servidor; nunca de un campo editable por el usuario. */
async function readClaims(user: User): Promise<{ role: Role | null; wholesale: boolean }> {
  const token = await user.getIdTokenResult()
  const r = token.claims.role
  return { role: r === 'admin' || r === 'seller' ? r : null, wholesale: token.claims.wholesale === true }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [wholesale, setWholesale] = useState(false)
  const [loading, setLoading] = useState(!DEMO_MODE)

  useEffect(() => {
    if (DEMO_MODE) return
    return onAuthStateChanged(auth, async (u) => {
      setUser(u ? { uid: u.uid, email: u.email } : null)
      const c = u ? await readClaims(u) : { role: null, wholesale: false }
      setRole(c.role)
      setWholesale(c.wholesale)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user, role, wholesale, loading,
      signIn: async (email, password) => { await signInWithEmailAndPassword(auth, email, password) },
      demoSignIn: DEMO_MODE
        ? (r) => {
            // En la vista previa pública nadie entra al panel: solo cuentas de cliente de prueba
            if (PUBLIC_PREVIEW && (r === 'admin' || r === 'seller')) return
            const who = r === 'admin' ? 'admin@demo.local' : r === 'seller' ? 'vendedor@demo.local' : r === 'customer' ? DEMO_CUSTOMER.email : 'nuevo@demo.local'
            setUser({ uid: r === 'customer' ? DEMO_CUSTOMER.uid : `demo-${r}`, email: who })
            setRole(r === 'customer' || r === 'newcustomer' ? null : r)
          }
        : undefined,
      logout: async () => {
        if (DEMO_MODE) { setUser(null); setRole(null); return }
        await signOut(auth)
      },
    }),
    [user, role, wholesale, loading],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
