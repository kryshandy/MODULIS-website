import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = process.env.OUT_DIR || 'C:/Users/HP/AppData/Local/Temp/opencode/modulis-shots'

import { mkdirSync } from 'node:fs'

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`)
})

mkdirSync(OUT, { recursive: true })

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(4200)

const shots = [
  ['01-hero', '.hero'],
  ['02-services', '.services'],
  ['03-about', '.about'],
  ['04-process', '.process'],
  ['05-work', '.work'],
  ['06-testimonials', '.testimonials'],
  ['07-contact', '.contact'],
  ['08-footer', '.footer']
]

for (const [name, sel] of shots) {
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView(), sel)
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  console.log(`shot: ${name}`)
}

await page.setViewportSize({ width: 390, height: 844 })
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(1800)
await page.screenshot({ path: `${OUT}/m-hero.png` })
await page.evaluate(() => document.querySelector('.services')?.scrollIntoView())
await page.waitForTimeout(1400)
await page.screenshot({ path: `${OUT}/m-services.png` })
await page.evaluate(() => document.querySelector('.contact')?.scrollIntoView())
await page.waitForTimeout(1400)
await page.screenshot({ path: `${OUT}/m-contact.png` })
console.log('mobile shots done')

const layout = await page.evaluate(() => {
  const width = document.documentElement.scrollWidth
  const vw = window.innerWidth
  return { overflowX: width - vw, vw }
})
console.log('mobile overflow-x:', JSON.stringify(layout))

await page.setViewportSize({ width: 1440, height: 900 })
const overflowDesktop = await page.evaluate(() => {
  return { overflow: document.documentElement.scrollWidth - window.innerWidth }
})
console.log('desktop overflow-x:', JSON.stringify(overflowDesktop))

console.log('JS ERRORS:', errors.length ? errors.join('\n') : 'none')

await browser.close()
