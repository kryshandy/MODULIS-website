import './styles/main.scss'

import { initSmoothScroll } from './js/smooth'
import { initPreloader } from './js/preloader'
import { initCursor } from './js/cursor'
import { initNav } from './js/nav'
import { initTheme } from './js/theme'
import {
  initHeroIntro,
  initScrollReveals,
  initCounters,
  initParallax,
  initScrollProgress,
  initHeroSpotlight,
  initProcessTimeline
} from './js/animations'
import {
  initSplitTitles,
  initMagnetic,
  initTilt,
  initVelocityMarquees,
  initHeroScroll,
  initWorkParallax,
  initVelocitySkew,
  initTagLines
} from './js/motion'
import { initContactForm } from './js/contact'
import { initModulesGrid } from './js/modules'
import { initWorkFilters } from './js/work'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.footer__year').textContent = new Date().getFullYear()

  initPreloader()
  initCursor()
  initNav()
  initTheme()
  initSmoothScroll()
  initSplitTitles()
  initHeroIntro()
  initScrollReveals()
  initCounters()
  initParallax()
  initHeroSpotlight()
  initHeroScroll()
  initScrollProgress()
  initTagLines()
  initModulesGrid()
  initProcessTimeline()
  initVelocitySkew()
  initVelocityMarquees()
  initMagnetic()
  initTilt()
  initWorkParallax()
  initWorkFilters()
  initContactForm()
})
