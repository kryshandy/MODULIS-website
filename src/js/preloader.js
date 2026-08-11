import { gsap } from 'gsap'

export function initPreloader() {
  const preloader = document.querySelector('.preloader')
  const fill = document.querySelector('.preloader__bar-fill')
  if (!preloader) return

  const state = { progress: 0 }

  const counterTween = gsap.to(state, {
    progress: 100,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate: () => {
      if (fill) fill.style.width = `${state.progress}%`
    }
  })

  const done = () => {
    preloader.classList.add('is-done')
    document.body.classList.add('is-loaded')
    document.body.style.overflow = ''
    window.dispatchEvent(new CustomEvent('modulis:loaded'))
    gsap.set(preloader, { display: 'none', delay: 1.2 })
  }

  window.addEventListener('load', () => {
    gsap.delayedCall(0.35, done)
  })

  // Sécurité : ne jamais bloquer l'accès au site
  gsap.delayedCall(3.5, () => {
    if (!preloader.classList.contains('is-done')) done()
  })
}
