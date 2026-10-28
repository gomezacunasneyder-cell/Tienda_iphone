import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

const env = import.meta.env

const config: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

/** Estas claves son públicas por diseño; la seguridad real está en firestore.rules y storage.rules. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

/**
 * Vista previa pública (build `npm run build:vista`): publica la tienda con los datos de prueba para mostrar el diseño.
 * Solo se activa a propósito con VITE_PUBLIC_PREVIEW=true y nunca si Firebase está configurado.
 */
export const PUBLIC_PREVIEW = env.VITE_PUBLIC_PREVIEW === 'true' && !isFirebaseConfigured

/** Modo demostración: datos en memoria. En desarrollo local sin Firebase, o en la vista previa pública. */
export const DEMO_MODE = (import.meta.env.DEV && !isFirebaseConfigured) || PUBLIC_PREVIEW

const app = initializeApp(isFirebaseConfigured ? config : { projectId: 'demo-tienda', apiKey: 'demo' })

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

if (env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectStorageEmulator(storage, '127.0.0.1', 9199)
}
