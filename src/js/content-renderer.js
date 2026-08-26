import defaultContent from '../data/site-content.json'

/**
 * Charge le contenu dynamique (soit via l'API locale si dispo, soit via le JSON importé)
 * et hydrate le DOM de la page publique.
 */
export async function initContentRenderer() {
  let content = defaultContent

  // En environnement de développement, on tente de récupérer la version à jour en temps réel
  if (import.meta.env.DEV) {
    try {
      const res = await fetch('/api/content', { cache: 'no-cache' })
      if (res.ok) {
        content = await res.json()
      }
    } catch {
      // Fallback gracieux sur le JSON importé
    }
  }

  if (!content) return

  // 1. Informations globales & Contact
  if (content.global) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((el) => {
      if (content.global.email) {
        el.setAttribute('href', `mailto:${content.global.email}`)
        if (el.textContent.includes('@')) {
          el.textContent = content.global.email
        }
      }
    })

    document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
      if (content.global.phoneClean) {
        el.setAttribute('href', `tel:${content.global.phoneClean}`)
      }
      if (content.global.phone && el.textContent.includes('+')) {
        el.textContent = content.global.phone
      }
    })

    const availEl = document.querySelector('.contact__availability')
    if (availEl && content.global.availability) {
      availEl.innerHTML = `<span class="hero__status"></span> ${escapeHtml(content.global.availability)}`
    }

    const claimEl = document.querySelector('.footer__claim')
    if (claimEl && content.global.footerClaim) {
      claimEl.textContent = content.global.footerClaim
    }
  }

  // 2. Hero Section
  if (content.hero) {
    const eyebrow = document.querySelector('.hero__eyebrow')
    if (eyebrow && content.hero.eyebrow) {
      eyebrow.innerHTML = `<span class="hero__status"></span> ${escapeHtml(content.hero.eyebrow)}`
    }

    const lineInners = document.querySelectorAll('.hero__title .hero__line-inner')
    if (lineInners.length >= 3) {
      if (content.hero.titleLine1) lineInners[0].textContent = content.hero.titleLine1
      if (content.hero.titleLine2) lineInners[1].textContent = content.hero.titleLine2
      if (content.hero.titleLineAccent) lineInners[2].textContent = content.hero.titleLineAccent
    }

    const heroDesc = document.querySelector('.hero__desc')
    if (heroDesc && content.hero.description) {
      heroDesc.innerHTML = sanitizeRichText(content.hero.description)
    }

    const heroTrust = document.querySelector('.hero__trust p')
    if (heroTrust && content.hero.trustNote) {
      heroTrust.innerHTML = sanitizeRichText(content.hero.trustNote)
    }
  }

  // 3. Services Section
  if (content.services) {
    const servicesTitle = document.querySelector('.services .section__title')
    if (servicesTitle && content.services.title) {
      servicesTitle.innerHTML = sanitizeRichText(content.services.title)
    }
    const servicesLead = document.querySelector('.services .section__lead')
    if (servicesLead && content.services.lead) {
      servicesLead.innerHTML = sanitizeRichText(content.services.lead)
    }
    const servicesTag = document.querySelector('.services .section__tag')
    if (servicesTag && content.services.tag) {
      servicesTag.innerHTML = `<span>${content.services.tag.slice(0, 2)}</span> ${content.services.tag.slice(2)}`
    }
  }

  // 4. À Propos Section
  if (content.about) {
    const aboutTitle = document.querySelector('.about .section__title')
    if (aboutTitle && content.about.title) {
      aboutTitle.innerHTML = sanitizeRichText(content.about.title)
    }
    const aboutLead = document.querySelector('.about__lead')
    if (aboutLead && content.about.lead) {
      aboutLead.innerHTML = sanitizeRichText(content.about.lead)
    }
    const aboutText = document.querySelector('.about__text')
    if (aboutText && content.about.text) {
      aboutText.innerHTML = sanitizeRichText(content.about.text)
    }

    // Statistiques / Compteurs
    if (Array.isArray(content.about.stats)) {
      const statEls = document.querySelectorAll('.stat')
      content.about.stats.forEach((stat, i) => {
        if (statEls[i]) {
          const valEl = statEls[i].querySelector('.stat__value')
          const lblEl = statEls[i].querySelector('.stat__label')
          if (valEl) {
            valEl.setAttribute('data-count', String(stat.count))
            valEl.setAttribute('data-suffix', stat.suffix || '')
          }
          if (lblEl && stat.label) {
            lblEl.textContent = stat.label
          }
        }
      })
    }
  }

  // 5. Process / Méthode
  if (content.process) {
    const processTitle = document.querySelector('.process .section__title')
    if (processTitle && content.process.title) {
      processTitle.innerHTML = sanitizeRichText(content.process.title)
    }
    if (Array.isArray(content.process.steps)) {
      const stepEls = document.querySelectorAll('.process__step')
      content.process.steps.forEach((step, i) => {
        if (stepEls[i]) {
          const durEl = stepEls[i].querySelector('.process__duration')
          const titleEl = stepEls[i].querySelector('.process__title')
          const descEl = stepEls[i].querySelector('.process__desc')
          if (durEl && step.duration) durEl.textContent = step.duration
          if (titleEl && step.title) titleEl.textContent = step.title
          if (descEl && step.desc) descEl.textContent = step.desc
        }
      })
    }
  }

  // 6. Projets / Work
  if (content.work) {
    const workTitle = document.querySelector('.work .section__title')
    if (workTitle && content.work.title) {
      workTitle.innerHTML = sanitizeRichText(content.work.title)
    }
    const workLead = document.querySelector('.work .section__lead')
    if (workLead && content.work.lead) {
      workLead.innerHTML = sanitizeRichText(content.work.lead)
    }
  }

  // 7. Testimonials
  if (content.testimonials) {
    const testTitle = document.querySelector('.testimonials .section__title')
    if (testTitle && content.testimonials.title) {
      testTitle.innerHTML = sanitizeRichText(content.testimonials.title)
    }
  }

  // 8. FAQ
  if (content.faq) {
    const faqTitle = document.querySelector('.faq .section__title')
    if (faqTitle && content.faq.title) {
      faqTitle.innerHTML = sanitizeRichText(content.faq.title)
    }
    const faqLead = document.querySelector('.faq .section__lead')
    if (faqLead && content.faq.lead) {
      faqLead.innerHTML = sanitizeRichText(content.faq.lead)
    }
  }

  // 9. Contact
  if (content.contact) {
    const contactTitle = document.querySelector('.contact__title')
    if (contactTitle && content.contact.title) {
      contactTitle.innerHTML = sanitizeRichText(content.contact.title)
    }
    const contactLead = document.querySelector('.contact .section__lead')
    if (contactLead && content.contact.lead) {
      contactLead.innerHTML = sanitizeRichText(content.contact.lead)
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function sanitizeRichText(str) {
  if (!str) return ''
  // Préserve les balises de mise en forme nécessaires (em, strong, br, span)
  return str
    .replace(/\n/g, '<br />')
}
