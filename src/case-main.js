import './styles/main.scss'

import { initSmoothScroll } from './js/smooth'
import { initPreloader } from './js/preloader'
import { initCursor } from './js/cursor'
import { initNav } from './js/nav'
import { initTheme } from './js/theme'
import { initScrollReveals, initCounters, initScrollProgress } from './js/animations'
import {
  initSplitTitles,
  initMagnetic,
  initTilt,
  initVelocityMarquees,
  initTagLines
} from './js/motion'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.footer__year').forEach((el) => {
    el.textContent = new Date().getFullYear()
  })

  initPreloader()
  initCursor()
  initNav()
  initTheme()
  initSmoothScroll()
  initSplitTitles()
  initScrollReveals()
  initCounters()
  initScrollProgress()
  initTagLines()
  initVelocityMarquees()
  initMagnetic()
  initTilt()
})
