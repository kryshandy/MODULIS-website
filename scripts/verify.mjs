import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`)
})

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })

// 1. Fonts
await page.evaluate(() => document.fonts.ready)
const fonts = await page.evaluate(() => {
  const loaded = [...document.fonts].map((f) => `${f.family}:${f.status}`)
  return loaded
})
check('fonts', fonts.length > 0 && fonts.every((f) => f.endsWith('loaded')), fonts.join(', '))

// 2. Preloader hides
await page.waitForTimeout(4200)
const preloaderGone = await page.evaluate(() => {
  const p = document.querySelector('.preloader')
  return p === null || p.classList.contains('is-done')
})
check('preloader', preloaderGone)

// 3. Hero intro applied (lines translated in)
const heroLines = await page.evaluate(() => {
  const inner = document.querySelector('.hero__line-inner')
  return inner ? getComputedStyle(inner).transform : 'none'
})
check('hero lines animées', heroLines !== 'none' || heroLines === 'matrix(1, 0, 0, 1, 0, 0)', heroLines)

// 4. All sections present
const sectionIds = ['hero', 'services', 'about', 'process', 'work', 'testimonials', 'contact', 'logos', 'faq']
for (const id of sectionIds) {
  const exists = await page.evaluate((i) => !!document.getElementById(i), id)
  check(`section #${id}`, exists)
}

// 5. No horizontal overflow (wide set)
const widths = [375, 390, 428, 768, 1024, 1280, 1440, 1920]
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 })
  await page.waitForTimeout(300)
  const ow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  check(`overflow @${w}px`, ow <= 0, `overflowX=${ow}px`)
}

// 6. Clipped content check (elements exceeding viewport width)
//    — ignore les éléments décoratifs contenus dans un parent overflow:hidden
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)
const clipped = await page.evaluate(() => {
  const hasHiddenParent = (el) => {
    let p = el.parentElement
    while (p) {
      if (getComputedStyle(p).overflowX === 'hidden' || getComputedStyle(p).overflow === 'hidden') return true
      p = p.parentElement
    }
    return false
  }
  const bad = []
  document.querySelectorAll('main *').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2) && !hasHiddenParent(el)) {
      const tag = el.tagName.toLowerCase()
      const cls = el.className ? `.${String(el.className).split(' ')[0]}` : ''
      bad.push(`${tag}${cls}`)
    }
  })
  return [...new Set(bad)].slice(0, 15)
})
check('aucun élement clippé @390', clipped.length === 0, clipped.join(', '))

// 7. Mobile menu
const burger = await page.$('.nav__burger')
await burger.click()
await page.waitForTimeout(600)
const menuOpen = await page.evaluate(() => document.querySelector('.mobile-menu').classList.contains('is-open'))
check('menu mobile ouvert', menuOpen)
await page.evaluate(() => document.querySelector('.nav__burger').click())
await page.waitForTimeout(500)

// 8. Counters animate
await page.evaluate(() => document.querySelector('.stats')?.scrollIntoView({ block: 'center' }))
await page.waitForTimeout(2600)
const counterVal = await page.evaluate(() => document.querySelector('.stat__value').textContent)
check('compteurs', /120/.test(counterVal), `"${counterVal}"`)

// 9. Reveals applied (vrai scroll wheel pour déclencher les ScrollTriggers)
const totalHeight = await page.evaluate(() => document.body.scrollHeight)
let y = 0
while (y < totalHeight) {
  await page.mouse.wheel(0, 500)
  y += 500
  await page.waitForTimeout(180)
}
await page.mouse.wheel(0, 500)
await page.waitForTimeout(1500)
const revealsApplied = await page.evaluate(() => {
  const els = document.querySelectorAll('.reveal')
  let hidden = 0
  els.forEach((el) => {
    if (el.closest('.hero')) return
    if (getComputedStyle(el).opacity < 0.5) hidden++
  })
  return { total: els.length, hidden }
})
check('reveals appliqués', revealsApplied.hidden === 0, JSON.stringify(revealsApplied))

// 10. Form validation
await page.evaluate(() => document.querySelector('.contact')?.scrollIntoView())
await page.waitForTimeout(800)
const submitBtn = await page.$('.contact__form button[type="submit"]')
await submitBtn.click()
await page.waitForTimeout(400)
const invalidShown = await page.evaluate(() => document.querySelectorAll('.field.is-invalid').length)
const noteText = await page.evaluate(() => document.querySelector('.contact__form-note').textContent)
check('validation formulaire', invalidShown >= 3 && noteText.length > 0, `${invalidShown} champs invalides — "${noteText}"`)

// 11. Work filters
await page.evaluate(() => document.querySelector('.work__filter-btn[data-filter="Branding"]').click())
await page.waitForTimeout(1300)
const brandingVisible = await page.evaluate(() => {
  const visible = [...document.querySelectorAll('.work__card')]
    .filter((c) => c.style.display !== 'none')
  return visible.length === 1 && visible[0].dataset.cat === 'Branding'
})
check('filtre Branding', brandingVisible)

await page.evaluate(() => document.querySelector('.work__filter-btn[data-filter="all"]').click())
await page.waitForTimeout(1300)
const allVisible = await page.evaluate(() => {
  return [...document.querySelectorAll('.work__card')].every((c) => c.style.display !== 'none')
})
check('filtre Tous', allVisible)

// 12. Modules grid animée (about)
await page.evaluate(() => document.querySelector('#modules-grid')?.scrollIntoView())
await page.waitForTimeout(1600)
const modulesOn = await page.evaluate(() => {
  const cells = document.querySelectorAll('#modules-grid span')
  const on = [...cells].filter((c) => parseFloat(getComputedStyle(c).opacity) > 0.5).length
  return { total: cells.length, on }
})
check('grille modulaire activée', modulesOn.total === 36 && modulesOn.on === 36, JSON.stringify(modulesOn))

// 13. Anchor smooth scroll to services
await page.evaluate(() => document.querySelector('.nav__link[href="#services"]').click())
await page.waitForTimeout(2200)
const scrolled = await page.evaluate(() => {
  const s = document.querySelector('#services')
  const r = s.getBoundingClientRect()
  return Math.abs(r.top) < 250
})
check('scroll ancré', scrolled)

// 13b. Titres splittés (motion éditoriale)
const splitWords = await page.evaluate(() => document.querySelectorAll('[data-split] .twi').length)
check('titres splittés', splitWords > 0, `${splitWords} mots animés`)

// 13c. Marquee piloté par JS (transform GSAP actif)
const giantTransform = await page.evaluate(() => {
  const t = document.querySelector('.footer__giant-track')
  return t ? getComputedStyle(t).transform : 'absent'
})
check('marquee GSAP', giantTransform !== 'none', giantTransform)

// 13d. Toggle de thème : clair -> sombre -> clair
await page.evaluate(() => document.querySelector('.theme-toggle').click())
await page.waitForTimeout(800)
const darkState = await page.evaluate(() => ({
  theme: document.documentElement.dataset.theme,
  pressed: document.querySelector('.theme-toggle').getAttribute('aria-checked'),
  bodyBg: getComputedStyle(document.body).backgroundColor
}))
check('toggle thème -> sombre', darkState.theme === 'dark' && darkState.pressed === 'true', darkState.bodyBg)
check('fond sombre appliqué', darkState.bodyBg === 'rgb(11, 18, 23)', darkState.bodyBg)
const persistedTheme = await page.evaluate(() => localStorage.getItem('modulis-theme'))
check('thème persisté', persistedTheme === 'dark')
const grainBlend = await page.evaluate(() => getComputedStyle(document.querySelector('.grain')).mixBlendMode)
check('grain adapté sombre', grainBlend === 'soft-light', grainBlend)
await page.evaluate(() => document.querySelector('.theme-toggle').click())
await page.waitForTimeout(800)
const lightState = await page.evaluate(() => ({
  theme: document.documentElement.dataset.theme,
  bodyBg: getComputedStyle(document.body).backgroundColor
}))
check('retour thème clair', lightState.theme === 'light' && lightState.bodyBg === 'rgb(247, 244, 239)', lightState.bodyBg)

// 13e. Mur de logos clients
const logosCount = await page.evaluate(() => document.querySelectorAll('.logos__group span').length)
check('mur de logos clients', logosCount >= 16, `${logosCount} wordmarks`)

// 13f. Preuve sociale dans le hero
const heroTrust = await page.evaluate(() => {
  const t = document.querySelector('.hero__trust')
  return !!t && t.textContent.includes('5,0 / 5') && t.textContent.includes('120+')
})
check('preuve sociale hero', heroTrust)

// 13g. Schema.org JSON-LD
const ldJson = await page.evaluate(
  () => document.querySelectorAll('script[type="application/ld+json"]').length
)
check('schema.org JSON-LD', ldJson >= 2, `${ldJson} blocs`)

// 13h. FAQ accordéon
await page.evaluate(() => document.querySelector('#faq')?.scrollIntoView())
await page.waitForTimeout(500)
await page.evaluate(() => document.querySelector('.faq__item summary').click())
await page.waitForTimeout(400)
const faqOpen = await page.evaluate(() => document.querySelector('.faq__item').open)
check('FAQ accordéon', faqOpen)

// 13i. Formulaire : consentement RGPD + honeypot
const formExtra = await page.evaluate(() => ({
  consent: !!document.querySelector('#consent[required]'),
  honeypot: !!document.querySelector('input[name="botcheck"]')
}))
check('RGPD + honeypot', formExtra.consent && formExtra.honeypot, JSON.stringify(formExtra))

// 13j. Barre d'actions rapides (mobile uniquement)
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(400)
const quickbarMobile = await page.evaluate(() => {
  const q = document.querySelector('.quickbar')
  return q ? getComputedStyle(q).display : 'absent'
})
check('quickbar visible @390', quickbarMobile === 'flex', quickbarMobile)
await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(400)
const quickbarDesktop = await page.evaluate(
  () => getComputedStyle(document.querySelector('.quickbar')).display
)
check('quickbar masquée desktop', quickbarDesktop === 'none', quickbarDesktop)

// 13k. Cartes réalisations -> études de cas
const workLinks = await page.evaluate(() =>
  [...document.querySelectorAll('.work__link')].map((a) => a.getAttribute('href'))
)
check('liens études de cas', workLinks.length === 4 && workLinks.every((h) => h.startsWith('case-')), workLinks.join(', '))

// 13l. Pages études de cas (multi-page)
for (const slug of ['case-kavala', 'case-nova', 'case-orbis', 'case-pulse']) {
  await page.goto(`${BASE}${slug}.html`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3200)
  const ok = await page.evaluate(() => {
    const hero = document.querySelector('.case-hero')
    return !!hero && hero.textContent.includes('Étude de cas') && !!document.querySelector('.case-kpis')
  })
  check(`page ${slug}.html`, ok)
}
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })

// 12. Cursor hidden on touch device (émulation tactile réelle)
import { devices } from 'playwright-core'
const ctx = await browser.newContext({
  ...devices['iPhone 13']
})
const mobilePage = await ctx.newPage()
mobilePage.on('pageerror', (e) => errors.push(`MOBILE PAGEERROR: ${e.message}`))
await mobilePage.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
await mobilePage.waitForTimeout(3500)
const cursorDisplay = await mobilePage.evaluate(() => {
  const c = document.querySelector('.cursor')
  return c ? getComputedStyle(c).display : 'absent'
})
check('curseur désactivé mobile tactile', cursorDisplay === 'none' || cursorDisplay === 'absent', cursorDisplay)
const touchOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
check('overflow @390 tactile', touchOverflow <= 0, `overflowX=${touchOverflow}px`)
await ctx.close()

console.log('\nJS ERRORS:', errors.length ? '\n' + errors.join('\n') : 'none')

await browser.close()
process.exit(errors.length ? 1 : 0)
