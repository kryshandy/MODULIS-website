import { gsap } from 'gsap'

export function initCursor() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!canHover) return

  const cursor = document.querySelector('.cursor')
  if (!cursor) return

  const dot = cursor.querySelector('.cursor__dot')
  const ring = cursor.querySelector('.cursor__ring')

  const xTo = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
  const yTo = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

  gsap.set(cursor, { xPercent: 0, yPercent: 0 })

  window.addEventListener('pointermove', (e) => {
    gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08, overwrite: 'auto' })
    xTo(e.clientX)
    yTo(e.clientY)
  })

  document.addEventListener('mouseover', (e) => {
    const labelTarget = e.target.closest('[data-cursor-label]')
    const hoverTarget = e.target.closest('a, button, input, select, textarea, label, [data-cursor-hover]')

    if (labelTarget) {
      cursor.classList.add('is-label')
      cursor.querySelector('.cursor__label').textContent = labelTarget.dataset.cursorLabel || 'Voir'
    } else if (hoverTarget) {
      cursor.classList.add('is-hovering')
      cursor.classList.remove('is-label')
    }
  })

  document.addEventListener('mouseout', (e) => {
    const related = e.relatedTarget
    const stillInside =
      (related && e.target.contains(related)) ||
      cursor.contains(e.target)
    if (stillInside) return
    cursor.classList.remove('is-hovering', 'is-label')
  })

  document.addEventListener('mousedown', () => cursor.classList.add('is-down'))
  document.addEventListener('mouseup', () => cursor.classList.remove('is-down'))
}
