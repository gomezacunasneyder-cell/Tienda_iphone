/** Tonos aproximados de los acabados de iPhone para pintar los círculos del selector de color. */
const HEX: Record<string, string> = {
  negro: '#2b2b30', grafito: '#4a4a50', 'gris espacial': '#55565b', gris: '#8e8e93', 'medianoche': '#232a35',
  blanco: '#f5f5f3', plata: '#e3e4e6', 'luz estelar': '#f1ebe0', dorado: '#e8d3a8', oro: '#e8d3a8',
  azul: '#9cc3e6', 'azul sierra': '#9bb5ce', 'azul alpino': '#8fa9bf', celeste: '#bcd9ef',
  lavanda: '#cdbfe8', morado: '#b9a3d9', 'morado oscuro': '#5e4d68', rosa: '#f6c6d0', rojo: '#c0392b',
  verde: '#a9c9a4', 'verde alpino': '#5d6f5a', amarillo: '#f5e08a', naranja: '#f2a65a',
  'titanio natural': '#bab4a8', 'titanio azul': '#4b5a73', 'titanio negro': '#3b3b3f', 'titanio blanco': '#ededeb', 'titanio desierto': '#c9ad8f',
}

const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const NORM_HEX = Object.fromEntries(Object.entries(HEX).map(([k, v]) => [norm(k), v]))

/** Color de un nombre; si no se reconoce, un pastel estable derivado del texto. */
export function colorHex(name: string): string {
  const n = norm(name)
  if (NORM_HEX[n]) return NORM_HEX[n]
  const key = Object.keys(NORM_HEX).find((k) => n.includes(k))
  if (key) return NORM_HEX[key]!
  const h = [...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 0)
  return `hsl(${h} 60% 82%)`
}

/** Fondo CSS del círculo: color sólido, mitades ("Verde / Blanco") o arcoíris ("Varios"). */
export function colorSwatch(name: string): string {
  if (/vari/i.test(name)) return 'conic-gradient(#f6c6d0, #cdbfe8, #9cc3e6, #a9c9a4, #f5e08a, #f6c6d0)'
  const parts = name.split(/\s*(?:\/|,|\by\b)\s*/i).filter(Boolean)
  if (parts.length > 1) return `linear-gradient(135deg, ${colorHex(parts[0]!)} 50%, ${colorHex(parts[1]!)} 50%)`
  return colorHex(name)
}
