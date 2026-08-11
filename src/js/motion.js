import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './smooth'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const canHover = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

// ============================================================
// 1. Split des titres — les mots entrent en cascade (style éditorial)
// ============================================================

export function initSplitTitles() {
  if (prefersReduced()) return

  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = []

    const wrap = (node) => {
      const frag = document.createDocumentFragment()
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part))
          return
        }
        const wrapEl = document.createElement('span')
        wrapEl.className = 'tw'
        const inner = document.createElement('span')
        inner.className = 'twi'
        inner.textContent = part
        wrapEl.appendChild(inner)
        frag.appendChild(wrapEl)
        words.push(inner)
      })
      node.parentNode.replaceChild(frag, node)
    }

    // Tous les nœuds texte, y compris dans <em>
    const textNodes = []
    const walk = (node) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === 3) textNodes.push(child)
        else if (child.nodeType === 1) walk(child)
      })
    }
    walk(el)
    textNodes.forEach(wrap)

    if (!words.length) return

    gsap.set(words, { yPercent: 115 })
    gsap.to(words, {
      yPercent: 0,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.035,
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true
      }
    })
  })
}

// ============================================================
// 2. Boutons magnétiques — le CTA suit la souris
// ============================================================

export function initMagnetic() {
  if (prefersReduced() || !canHover()) return

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.3
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    })

    el.addEventListener('pointerleave', () => {
      xTo(0)
      yTo(0)
    })
  })
}

// ============================================================
// 3. Tilt 3D — les visuels des projets suivent la souris
// ============================================================

export function initTilt() {
  if (prefersReduced() || !canHover()) return

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const strength = parseFloat(el.dataset.tilt) || 7
    const rx = gsap.quickTo(el, 'rotationX', {
      duration: 0.5,
      ease: 'power3.out',
      transformPerspective: 900
    })
    const ry = gsap.quickTo(el, 'rotationY', {
      duration: 0.5,
      ease: 'power3.out',
      transformPerspective: 900
    })

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * strength)
      rx(-py * strength)
    })

    el.addEventListener('pointerleave', () => {
      rx(0)
      ry(0)
    })
  })
}

// ============================================================
// 4. Marquee à vélocité — la vitesse suit le scroll + pause au survol
// ============================================================

export function initVelocityMarquees() {
  if (prefersReduced()) return

  const lenis = getLenis()
  const items = gsap.utils.toArray('[data-marquee]')
  if (!items.length) return

  const tweens = items.map((el) => ({
    el,
    tween: gsap.to(el, {
      xPercent: -50,
      duration: parseFloat(el.dataset.marquee) || 30,
      ease: 'none',
      repeat: -1
    })
  }))

  items.forEach((el) => {
    const tween = tweens.find((t) => t.el === el).tween
    el.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: 0.15, duration: 0.5 }))
    el.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: 0.5 }))
  })

  gsap.ticker.add(() => {
    const v = lenis ? Math.abs(lenis.velocity || 0) : 0
    const boost = gsap.utils.clamp(1, 3.2, 1 + v * 0.022)
    tweens.forEach(({ el, tween }) => {
      if (el.matches(':hover')) return
      const smooth = gsap.utils.interpolate(tween.timeScale(), boost, 0.12)
      tween.timeScale(smooth)
    })
  })
}

// ============================================================
// 5. Hero — fondu + parallax au scroll
// ============================================================

export function initHeroScroll() {
  if (prefersReduced()) return

  gsap.to('.hero__inner', {
    yPercent: -14,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom 30%',
      scrub: true
    }
  })

  gsap.fromTo(
    '.hero__bg',
    { scale: 1.12 },
    {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    }
  )
}

// ============================================================
// 6. Parallax interne des visuels projets (profondeur)
// ============================================================

export function initWorkParallax() {
  if (prefersReduced()) return

  gsap.utils.toArray('.work__visual').forEach((visual) => {
    const monogram = visual.querySelector('.work__monogram')
    const orbs = visual.querySelector('.work__orbs')

    if (monogram) {
      gsap.fromTo(
        monogram,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: visual,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      )
    }

    if (orbs) {
      gsap.fromTo(
        orbs,
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: visual,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      )
    }
  })
}

// ============================================================
// 7. Skew du titre hero selon la vélocité du scroll
// ============================================================

export function initVelocitySkew() {
  if (prefersReduced()) return

  const target = document.querySelector('.hero__title')
  const lenis = getLenis()
  if (!target || !lenis) return

  let current = 0
  const setSkew = gsap.quickTo(target, 'skewY', { duration: 0.5, ease: 'power3.out' })

  gsap.ticker.add(() => {
    const v = lenis.velocity || 0
    const goal = gsap.utils.clamp(-6, 6, -v * 0.04)
    current = gsap.utils.interpolate(current, goal, 0.06)
    setSkew(current)
  })
}

// ============================================================
// 8. Traits des tags de section — dessinés à l'entrée
// ============================================================

export function initTagLines() {
  document.querySelectorAll('.section__head, .contact__head').forEach((head) => {
    ScrollTrigger.create({
      trigger: head,
      start: 'top 85%',
      once: true,
      onEnter: () => head.classList.add('is-in')
    })
  })
}
