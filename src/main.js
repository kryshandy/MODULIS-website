import './styles/main.scss'

import { initSmoothScroll } from './js/smooth'
import { initPreloader } from './js/preloader'
import { initCursor } from './js/cursor'
import { initNav } from './js/nav'
import { initHeroIntro, initScrollReveals, initCounters, initParallax } from './js/animations'
import { initContactForm } from './js/contact'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.footer__year').textContent = new Date().getFullYear()

  initPreloader()
  initCursor()
  initNav()
  initSmoothScroll()
  initHeroIntro()
  initScrollReveals()
  initCounters()
  initParallax()
  initContactForm()
})
