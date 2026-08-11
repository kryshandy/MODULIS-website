import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initWorkFilters() {
  const buttons = gsap.utils.toArray('.work__filter-btn')
  const grid = document.querySelector('.work__grid')
  if (!buttons.length || !grid) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const applyFilter = (filter) => {
    const cards = gsap.utils.toArray('.work__card')

    const visible = filter === 'all'
      ? cards
      : cards.filter((card) => card.dataset.cat === filter)
    const hidden = cards.filter((card) => !visible.includes(card))

    if (reduced) {
      hidden.forEach((c) => c.style.display = 'none')
      visible.forEach((c) => c.style.display = '')
      return
    }

    gsap.to(hidden, {
      opacity: 0,
      scale: 0.92,
      y: 18,
      duration: 0.35,
      ease: 'power2.in',
      stagger: 0.03,
      onComplete: () => {
        hidden.forEach((c) => (c.style.display = 'none'))
        gsap.fromTo(
          visible,
          { opacity: 0, scale: 0.92, y: 18, display: 'flex' },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: 'power3.out',
            clearProps: 'display',
            onComplete: () => ScrollTrigger.refresh()
          }
        )
      }
    })
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-active')) return
      buttons.forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')
      applyFilter(btn.dataset.filter)
    })
  })
}
