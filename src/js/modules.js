import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Grille modulaire signature : les cellules forment le "M" de MODULIS
// et s'illuminent en cascade à l'entrée dans le viewport.
export function initModulesGrid() {
  const grid = document.getElementById('modules-grid')
  if (!grid) return

  const COLS = 6
  const ROWS = 6

  // Positions formant le "M" (ligne, colonne)
  const M = new Set()
  for (let r = 0; r < ROWS; r++) {
    M.add(`${r},0`)
    M.add(`${r},${COLS - 1}`)
  }
  M.add('1,1')
  M.add('2,2')
  M.add('3,2')
  M.add('4,1')

  const cells = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('span')
      const key = `${r},${c}`
      if (M.has(key)) cell.classList.add('is-m')
      grid.appendChild(cell)
      cells.push(cell)
    }
  }

  const normal = cells.filter((c) => !c.classList.contains('is-m'))
  const letter = cells.filter((c) => c.classList.contains('is-m'))

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cells.forEach((c) => c.classList.add('is-on'))
    return
  }

  gsap.set(cells, { transformOrigin: 'center', scale: 0.5 })

  gsap.timeline({
    scrollTrigger: {
      trigger: grid,
      start: 'top 80%',
      once: true
    }
  })
    .to(letter, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      stagger: 0.035,
      ease: 'power2.out'
    })
    .to(
      normal,
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.012,
        ease: 'power2.out'
      },
      '-=0.3'
    )
    .fromTo(
      '.about__modules-meta',
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      '-=0.4'
    )
}
