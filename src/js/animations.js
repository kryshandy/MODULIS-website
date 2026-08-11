import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initHeroIntro() {
  const lines = gsap.utils.toArray('.hero__line-inner')
  const reveals = gsap.utils.toArray('.hero .reveal')

  const tl = gsap.timeline({ paused: true })

  tl.to(lines, {
    y: 0,
    duration: 1.1,
    stagger: 0.12,
    ease: 'power4.out'
  })
    .fromTo(
      reveals,
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
      '-=0.6'
    )

  if (prefersReduced()) {
    gsap.set([lines, reveals], { y: 0, opacity: 1 })
    return
  }

  const start = () => tl.play()

  // L'intro démarre quand le preloader se retire
  window.addEventListener('modulis:loaded', start, { once: true })
}

export function initScrollReveals() {
  if (prefersReduced()) return

  const items = gsap.utils.toArray('.reveal').filter(
    (item) => !item.closest('.hero') && !item.hasAttribute('data-split')
  )

  items.forEach((item) => {
    gsap.fromTo(
      item,
      { y: 42, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 86%',
          once: true
        }
      }
    )
  })
}

export function initCounters() {
  const counters = gsap.utils.toArray('.stat__value')

  counters.forEach((counter) => {
    const target = Number(counter.dataset.count || 0)
    const suffix = counter.dataset.suffix || ''
    const obj = { value: 0 }

    gsap.to(obj, {
      value: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: counter,
        start: 'top 88%',
        once: true
      },
      onUpdate: () => {
        counter.textContent = `${Math.round(obj.value)}${suffix}`
      }
    })
  })
}

export function initHeroSpotlight() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!canHover || prefersReduced()) return

  const spotlight = document.querySelector('.hero__spotlight')
  if (!spotlight) return

  const xTo = gsap.quickTo(spotlight, 'x', { duration: 1.2, ease: 'power3.out' })
  const yTo = gsap.quickTo(spotlight, 'y', { duration: 1.2, ease: 'power3.out' })

  const hero = document.querySelector('.hero')

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect()
    xTo(e.clientX - r.left - r.width / 2)
    yTo(e.clientY - r.top - r.height / 2)
  })
}

export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress span')
  if (!bar) return

  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight
    const p = h > 0 ? window.scrollY / h : 0
    bar.style.transform = `scaleX(${p})`
  }

  window.addEventListener('scroll', update, { passive: true })
  update()
}

export function initProcessTimeline() {
  if (prefersReduced()) return

  const line = document.querySelector('.process__line span')
  const steps = gsap.utils.toArray('.process__step')

  if (!line || !steps.length) return

  gsap.to(line, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.process__timeline',
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: 0.6
    }
  })

  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 70%',
      onEnter: () => step.classList.add('is-in-view'),
      once: true
    })
  })
}

export function initParallax() {
  if (prefersReduced()) return

  gsap.to('.hero__glow--1', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  })

  gsap.to('.hero__glow--2', {
    yPercent: -14,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  })

  // Parallax des chips flottants
  gsap.utils.toArray('.hero__chip').forEach((chip) => {
    gsap.to(chip, {
      yPercent: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    })
  })
}
