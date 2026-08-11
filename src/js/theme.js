// ============================================================
// Theme — bascule clair / sombre (charte MODULIS)
// Persistance : localStorage 'modulis-theme'
// Valeur par défaut : préférence système (via script inline <head>)
// ============================================================

const KEY = 'modulis-theme'
const META_COLORS = { light: '#F7F4EF', dark: '#0B1217' }

export function initTheme() {
  const root = document.documentElement
  const btn = document.querySelector('.theme-toggle')
  if (!btn) return

  const current = () => (root.dataset.theme === 'dark' ? 'dark' : 'light')

  const sync = () => {
    const theme = current()
    btn.setAttribute('aria-checked', theme === 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = META_COLORS[theme]
  }

  sync()

  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark'

    // Transition douce entre les deux thèmes
    root.classList.add('theme-switching')
    root.dataset.theme = next
    try {
      localStorage.setItem(KEY, next)
    } catch (e) {
      /* stockage indisponible : on ignore */
    }
    sync()
    window.setTimeout(() => root.classList.remove('theme-switching'), 700)
  })

  // Garde-fou : synchronise l'état si le thème change (SSR / devtools)
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      root.dataset.theme = e.newValue
      root.classList.add('theme-switching')
      sync()
      window.setTimeout(() => root.classList.remove('theme-switching'), 700)
    }
  })
}
