import { gsap } from 'gsap'
import { scrollToTarget } from './smooth'

export function initNav() {
  const nav = document.querySelector('.nav')
  const burger = document.querySelector('.nav__burger')
  const menu = document.querySelector('.mobile-menu')
  const links = document.querySelectorAll('.nav__link, .mobile-menu__link')
  const navLinks = document.querySelectorAll('.nav__link')
  const sections = document.querySelectorAll('section[id], #hero')

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40)
    updateActiveLink()
  }

  const updateActiveLink = () => {
    const pos = window.scrollY + window.innerHeight * 0.35
    let current = null

    sections.forEach((section) => {
      if (section.offsetTop <= pos) current = section
    })

    if (!current) return
    const id = current.id

    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`
      link.classList.toggle('is-active', active)
    })
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href')
      if (!target || !target.startsWith('#')) return
      e.preventDefault()
      closeMenu()
      scrollToTarget(target)
    })
  })

  const openMenu = () => {
    burger.classList.add('is-open')
    menu.classList.add('is-open')
    burger.setAttribute('aria-expanded', 'true')
    menu.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
  }

  const closeMenu = () => {
    burger.classList.remove('is-open')
    menu.classList.remove('is-open')
    burger.setAttribute('aria-expanded', 'false')
    menu.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
  }

  burger.addEventListener('click', () => {
    menu.classList.contains('is-open') ? closeMenu() : openMenu()
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu()
  })
}
