/**
 * Animación de "agregar al carrito": la foto del producto vuela en arco hasta el ícono del carrito,
 * salen chispas rojas y de luz desde el botón y el carrito rebota. Solo DOM + Web Animations (sin dependencias).
 * Avisa con el evento `cart:added` para que el encabezado muestre el aviso.
 */
export interface CartAddedDetail { name: string; image?: string; qty: number }
export const CART_ADDED = 'cart:added'

const SPARKS = ['#ff3b4b', '#ff6f61', '#22d3ee', '#8b5cf6', '#ffffff']

const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return true } }

/** El carrito visible del encabezado (puede haber más de uno según el tamaño de pantalla). */
function cartTarget(): HTMLElement | null {
  return [...document.querySelectorAll<HTMLElement>('[data-cart-target]')].find((el) => el.getClientRects().length > 0) ?? null
}

function sparks(x: number, y: number) {
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span')
    const a = (Math.PI * 2 * i) / 14, d = 34 + Math.random() * 26
    Object.assign(s.style, { position: 'fixed', left: `${x}px`, top: `${y}px`, width: '6px', height: '6px', borderRadius: '99px', background: SPARKS[i % SPARKS.length], pointerEvents: 'none', zIndex: '90' })
    document.body.appendChild(s)
    s.animate(
      [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(.2)`, opacity: 0 }],
      { duration: 600 + Math.random() * 200, easing: 'cubic-bezier(.2,.8,.2,1)' },
    ).onfinish = () => s.remove()
  }
}

export function flyToCart(from: HTMLElement | null, detail: CartAddedDetail) {
  const done = () => window.dispatchEvent(new CustomEvent<CartAddedDetail>(CART_ADDED, { detail }))
  const target = cartTarget()
  if (!from || !target || reduced()) { done(); return }

  const a = from.getBoundingClientRect(), b = target.getBoundingClientRect()
  const sx = a.left + a.width / 2, sy = a.top + a.height / 2
  sparks(sx, sy)

  const size = 72
  const ghost = document.createElement('div')
  Object.assign(ghost.style, {
    position: 'fixed', left: `${sx - size / 2}px`, top: `${sy - size / 2}px`, width: `${size}px`, height: `${size}px`, borderRadius: '22px',
    background: detail.image ? `#1b1b22 url("${detail.image}") center / contain no-repeat` : 'linear-gradient(135deg,#ff3b4b,#8b5cf6)',
    boxShadow: '0 0 0 2px rgb(255 59 75 / .7), 0 18px 40px -12px rgb(255 45 61 / .6)', pointerEvents: 'none', zIndex: '91',
  })
  document.body.appendChild(ghost)
  const dx = b.left + b.width / 2 - sx, dy = b.top + b.height / 2 - sy
  // Arco: sube primero y luego cae sobre el carrito, girando y encogiéndose
  ghost.animate(
    [
      { transform: 'translate(0,0) scale(.6) rotate(0deg)', opacity: 0 },
      { transform: 'translate(0,-24px) scale(1.05) rotate(-6deg)', opacity: 1, offset: 0.18 },
      { transform: `translate(${dx * 0.55}px, ${Math.min(dy, 0) * 0.6 - 90}px) scale(.8) rotate(8deg)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(.15) rotate(20deg)`, opacity: 0.6 },
    ],
    { duration: 900, easing: 'cubic-bezier(.45,.05,.4,1)' },
  ).onfinish = () => {
    ghost.remove()
    target.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.35) rotate(-12deg)' }, { transform: 'scale(.9) rotate(6deg)' }, { transform: 'scale(1)' }],
      { duration: 500, easing: 'ease-out' },
    )
    done()
  }
}
