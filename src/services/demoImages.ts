/** Ilustraciones SVG de PRUEBA para ver el diseño sin fotos reales. Se reemplazan por tus fotos de inventario. */

const wrap = (inner: string, bg: [string, string], tag: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="400" height="400" fill="url(#b)"/><ellipse cx="200" cy="362" rx="120" ry="12" fill="#000" fill-opacity=".10"/>${inner}<text x="386" y="388" text-anchor="end" font-family="sans-serif" font-size="11" fill="#475569" fill-opacity=".7">${tag}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const scratches = '<g stroke="#fff" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round"><path d="M150 120l26 34"/><path d="M232 270l20-28"/><path d="M170 300l14-10"/></g>'

export function phoneImg(body: string, used = false, back = true, pro = true): string {
  const lens = (cx: number, cy: number) => `<circle cx="${cx}" cy="${cy}" r="12" fill="#111827" stroke="#94a3b8" stroke-width="2"/>`
  const cam = back
    ? pro
      ? `<rect x="146" y="68" width="68" height="68" rx="18" fill="#0f172a" fill-opacity=".55"/>${lens(168, 90)}${lens(196, 90)}${lens(182, 116)}<circle cx="224" cy="80" r="4" fill="#fde68a"/>`
      : `<rect x="146" y="68" width="44" height="72" rx="20" fill="#0f172a" fill-opacity=".55"/>${lens(168, 88)}${lens(168, 120)}<circle cx="208" cy="80" r="4" fill="#fde68a"/>`
    : ''
  const inner = `<rect x="128" y="36" width="144" height="304" rx="32" fill="${body}"/><rect x="128" y="36" width="144" height="304" rx="32" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>${cam}<circle cx="200" cy="200" r="16" fill="#fff" fill-opacity=".85"/>${used ? scratches : ''}`
  return wrap(inner, ['#f8fafc', '#e2e8f0'], used ? 'PRUEBA · usado' : 'PRUEBA · nuevo')
}

export function chargerImg(used = false): string {
  return wrap(`<rect x="150" y="110" width="100" height="130" rx="22" fill="#fff" stroke="#cbd5e1" stroke-width="3"/><rect x="175" y="240" width="50" height="40" rx="6" fill="#94a3b8"/><rect x="176" y="168" width="48" height="22" rx="11" fill="#e2e8f0"/>${used ? scratches : ''}`, ['#f1f5f9', '#e2e8f0'], used ? 'PRUEBA · usado' : 'PRUEBA · nuevo')
}

export function cableImg(): string {
  return wrap(`<path d="M110 270 C 110 130, 290 330, 290 140" fill="none" stroke="#f8fafc" stroke-width="14" stroke-linecap="round"/><path d="M110 270 C 110 130, 290 330, 290 140" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/><rect x="92" y="268" width="36" height="46" rx="8" fill="#94a3b8"/><rect x="272" y="96" width="36" height="48" rx="8" fill="#94a3b8"/>`, ['#f1f5f9', '#dbeafe'], 'PRUEBA · nuevo')
}

export function caseImg(color: string): string {
  return wrap(`<rect x="128" y="36" width="144" height="304" rx="36" fill="${color}"/><rect x="142" y="50" width="76" height="76" rx="20" fill="#0f172a" fill-opacity=".35"/><circle cx="200" cy="270" r="14" fill="#fff" fill-opacity=".45"/>`, ['#fdf2f8', '#f1f5f9'], 'PRUEBA · nuevo')
}

export function glassImg(): string {
  return wrap(`<rect x="140" y="50" width="120" height="280" rx="26" fill="#bae6fd" fill-opacity=".45" stroke="#38bdf8" stroke-width="4"/><path d="M160 90 L215 70 M160 130 L240 100" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".8"/>`, ['#f0f9ff', '#e0f2fe'], 'PRUEBA · nuevo')
}

export function earbudsImg(used = false): string {
  return wrap(`<rect x="130" y="210" width="140" height="100" rx="40" fill="#fff" stroke="#cbd5e1" stroke-width="3"/><circle cx="200" cy="260" r="7" fill="#cbd5e1"/><g fill="#fff" stroke="#cbd5e1" stroke-width="3"><rect x="150" y="70" width="28" height="100" rx="14"/><circle cx="164" cy="82" r="24"/><rect x="222" y="70" width="28" height="100" rx="14"/><circle cx="236" cy="82" r="24"/></g>${used ? scratches : ''}`, ['#f8fafc', '#e2e8f0'], used ? 'PRUEBA · usado' : 'PRUEBA · nuevo')
}

export function powerbankImg(): string {
  return wrap(`<rect x="130" y="80" width="140" height="240" rx="30" fill="#1e293b"/><circle cx="200" cy="200" r="46" fill="none" stroke="#38bdf8" stroke-width="4"/><circle cx="200" cy="200" r="30" fill="none" stroke="#38bdf8" stroke-opacity=".5" stroke-width="3"/><g fill="#22c55e"><circle cx="170" cy="115" r="5"/><circle cx="190" cy="115" r="5"/><circle cx="210" cy="115" r="5"/><circle cx="230" cy="115" r="5" fill="#475569"/></g>`, ['#f1f5f9', '#dbeafe'], 'PRUEBA · nuevo')
}

export function magsafeImg(used = false): string {
  return wrap(`<circle cx="200" cy="170" r="84" fill="#fff" stroke="#cbd5e1" stroke-width="3"/><circle cx="200" cy="170" r="52" fill="none" stroke="#cbd5e1" stroke-width="3"/><circle cx="200" cy="170" r="10" fill="#e2e8f0"/><path d="M200 254 C 200 300, 280 300, 280 340" fill="none" stroke="#f8fafc" stroke-width="10" stroke-linecap="round"/>${used ? scratches : ''}`, ['#f8fafc', '#e2e8f0'], used ? 'PRUEBA · usado' : 'PRUEBA · nuevo')
}
