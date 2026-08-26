import './admin.scss'
import defaultContent from '../data/site-content.json'

let currentContent = JSON.parse(JSON.stringify(defaultContent))
let isDirty = false

const TAB_DESCRIPTIONS = {
  general: {
    title: 'Général & Contact',
    desc: "Paramètres d'identité, coordonnées de contact, réseaux sociaux et référencement SEO."
  },
  hero: {
    title: 'Hero & En-tête',
    desc: "Surtitre, titres en 3 lignes avec mot d'accent en italique dégradé, boutons d'action et puces."
  },
  services: {
    title: 'Services & Offres',
    desc: 'Titre de la section, phrase d’introduction et cartes d’expertises modulaires.'
  },
  about: {
    title: 'À Propos & Chiffres',
    desc: 'Présentation du studio, valeurs clés et compteurs statistiques animés.'
  },
  process: {
    title: 'Méthode & Étapes',
    desc: 'Déroulé chronologique des 4 phases de projet de la découverte à la livraison.'
  },
  work: {
    title: 'Réalisations & Projets',
    desc: 'Portfolio des études de cas, métriques de résultat et catégories de filtres.'
  },
  testimonials: {
    title: 'Témoignages Clients',
    desc: 'Citations et retours d’expérience vérifiés de nos clients partenaires.'
  },
  faq: {
    title: 'Questions / FAQ',
    desc: 'Gestion des questions fréquentes avec ajout et suppression dynamique.'
  },
  cases: {
    title: 'Études de cas détaillées',
    desc: 'Titres, accroches et indicateurs KPI propres aux 4 pages d’études de cas.'
  },
  json: {
    title: 'Export & JSON Brut',
    desc: 'Éditeur de code JSON direct, téléchargement de sauvegarde et restauration.'
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme()
  initTabs()
  await loadContent()
  initSaveActions()
  initFaqActions()
  initJsonActions()
})

// 1. Theme Toggle
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle')
  const saved = localStorage.getItem('modulis-admin-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', saved)

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('modulis-admin-theme', next)
  })
}

// 2. Tab Navigation
function initTabs() {
  const navItems = document.querySelectorAll('.admin-nav__item')
  const panels = document.querySelectorAll('.admin-panel')
  const titleEl = document.getElementById('tab-title')
  const descEl = document.getElementById('tab-desc')

  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab
      navItems.forEach((b) => b.classList.remove('is-active'))
      panels.forEach((p) => p.classList.remove('is-active'))

      btn.classList.add('is-active')
      const targetPanel = document.getElementById(`panel-${tab}`)
      if (targetPanel) targetPanel.classList.add('is-active')

      if (TAB_DESCRIPTIONS[tab]) {
        titleEl.textContent = TAB_DESCRIPTIONS[tab].title
        descEl.textContent = TAB_DESCRIPTIONS[tab].desc
      }

      if (tab === 'json') {
        updateRawJsonEditor()
      }
    })
  })
}

// 3. Load & Bind Content
async function loadContent() {
  try {
    const res = await fetch('/api/content', { cache: 'no-cache' })
    if (res.ok) {
      currentContent = await res.json()
    }
  } catch (err) {
    console.warn('API locale non disponible, utilisation du contenu par défaut.', err)
  }

  populateForm()
  markClean()
}

function populateForm() {
  // A. Scalar inputs [data-bind]
  document.querySelectorAll('[data-bind]').forEach((input) => {
    const path = input.dataset.bind
    const val = getObjectValue(currentContent, path)
    if (val !== undefined && val !== null) {
      input.value = val
    }
    input.addEventListener('input', () => {
      setObjectValue(currentContent, path, input.value)
      markDirty()
    })
  })

  // B. Hero Chips
  const chipsInput = document.getElementById('hero-chips-input')
  if (chipsInput && Array.isArray(currentContent.hero?.chips)) {
    chipsInput.value = currentContent.hero.chips.join(', ')
    chipsInput.addEventListener('input', () => {
      currentContent.hero.chips = chipsInput.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      markDirty()
    })
  }

  // C. Render repeating lists
  renderServices()
  renderAboutStats()
  renderAboutValues()
  renderProcessSteps()
  renderWorkProjects()
  renderTestimonials()
  renderFaq()
  renderCases()
}

// Helper: Get value from nested object path
function getObjectValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

// Helper: Set value to nested object path
function setObjectValue(obj, path, value) {
  const parts = path.split('.')
  const last = parts.pop()
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {}
    return acc[part]
  }, obj)
  target[last] = value
}

// 4. Renderers for complex lists
function renderServices() {
  const container = document.getElementById('services-items-container')
  if (!container || !Array.isArray(currentContent.services?.items)) return

  container.innerHTML = ''
  currentContent.services.items.forEach((item, index) => {
    const card = document.createElement('div')
    card.className = 'admin-item-card'
    card.innerHTML = `
      <div class="admin-item-card__header">
        <h3>Service #${item.id || index + 1}</h3>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Titre du service</label>
          <input type="text" class="admin-input s-title" value="${escapeAttr(item.title || '')}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Tags / Compétences (séparés par virgules)</label>
          <input type="text" class="admin-input s-tags" value="${escapeAttr((item.tags || []).join(', '))}" />
        </div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Description détaillée</label>
        <textarea class="admin-textarea s-desc" rows="2">${escapeHtml(item.desc || '')}</textarea>
      </div>
    `

    card.querySelector('.s-title').addEventListener('input', (e) => {
      item.title = e.target.value
      markDirty()
    })
    card.querySelector('.s-tags').addEventListener('input', (e) => {
      item.tags = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
      markDirty()
    })
    card.querySelector('.s-desc').addEventListener('input', (e) => {
      item.desc = e.target.value
      markDirty()
    })

    container.appendChild(card)
  })
}

function renderAboutStats() {
  const container = document.getElementById('about-stats-container')
  if (!container || !Array.isArray(currentContent.about?.stats)) return

  container.innerHTML = ''
  currentContent.about.stats.forEach((stat, i) => {
    const row = document.createElement('div')
    row.className = 'admin-form-row'
    row.innerHTML = `
      <div class="admin-form-group">
        <label class="admin-label">Nombre / Valeur</label>
        <input type="number" class="admin-input stat-count" value="${stat.count || 0}" />
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Suffixe (+, %, ans)</label>
        <input type="text" class="admin-input stat-suffix" value="${escapeAttr(stat.suffix || '')}" />
      </div>
      <div class="admin-form-group" style="grid-column: span 2;">
        <label class="admin-label">Label de la statistique</label>
        <input type="text" class="admin-input stat-label" value="${escapeAttr(stat.label || '')}" />
      </div>
    `

    row.querySelector('.stat-count').addEventListener('input', (e) => {
      stat.count = parseInt(e.target.value, 10) || 0
      markDirty()
    })
    row.querySelector('.stat-suffix').addEventListener('input', (e) => {
      stat.suffix = e.target.value
      markDirty()
    })
    row.querySelector('.stat-label').addEventListener('input', (e) => {
      stat.label = e.target.value
      markDirty()
    })

    container.appendChild(row)
  })
}

function renderAboutValues() {
  const container = document.getElementById('about-values-container')
  if (!container || !Array.isArray(currentContent.about?.values)) return

  container.innerHTML = ''
  currentContent.about.values.forEach((val) => {
    const div = document.createElement('div')
    div.className = 'admin-form-group'
    div.innerHTML = `
      <label class="admin-label">Valeur : ${escapeHtml(val.title)}</label>
      <input type="text" class="admin-input val-title admin-mb" value="${escapeAttr(val.title || '')}" />
      <input type="text" class="admin-input val-desc" value="${escapeAttr(val.desc || '')}" />
    `

    div.querySelector('.val-title').addEventListener('input', (e) => {
      val.title = e.target.value
      markDirty()
    })
    div.querySelector('.val-desc').addEventListener('input', (e) => {
      val.desc = e.target.value
      markDirty()
    })

    container.appendChild(div)
  })
}

function renderProcessSteps() {
  const container = document.getElementById('process-steps-container')
  if (!container || !Array.isArray(currentContent.process?.steps)) return

  container.innerHTML = ''
  currentContent.process.steps.forEach((step) => {
    const card = document.createElement('div')
    card.className = 'admin-item-card'
    card.innerHTML = `
      <div class="admin-item-card__header">
        <h3>Étape ${step.num || ''} — ${escapeHtml(step.title || '')}</h3>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Titre de l'étape</label>
          <input type="text" class="admin-input p-title" value="${escapeAttr(step.title || '')}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Durée estimée (ex: Sem. 1–2)</label>
          <input type="text" class="admin-input p-duration" value="${escapeAttr(step.duration || '')}" />
        </div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Description de la phase</label>
        <textarea class="admin-textarea p-desc" rows="2">${escapeHtml(step.desc || '')}</textarea>
      </div>
    `

    card.querySelector('.p-title').addEventListener('input', (e) => {
      step.title = e.target.value
      markDirty()
    })
    card.querySelector('.p-duration').addEventListener('input', (e) => {
      step.duration = e.target.value
      markDirty()
    })
    card.querySelector('.p-desc').addEventListener('input', (e) => {
      step.desc = e.target.value
      markDirty()
    })

    container.appendChild(card)
  })
}

function renderWorkProjects() {
  const container = document.getElementById('work-projects-container')
  if (!container || !Array.isArray(currentContent.work?.projects)) return

  container.innerHTML = ''
  currentContent.work.projects.forEach((proj) => {
    const card = document.createElement('div')
    card.className = 'admin-item-card'
    card.innerHTML = `
      <div class="admin-item-card__header">
        <h3>${escapeHtml(proj.name || 'Projet')} [${escapeHtml(proj.cat || '')}]</h3>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Nom du projet</label>
          <input type="text" class="admin-input w-name" value="${escapeAttr(proj.name || '')}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Catégorie (Branding, Web, Marketing, Automation)</label>
          <input type="text" class="admin-input w-cat" value="${escapeAttr(proj.cat || '')}" />
        </div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Description / Résultat clé</label>
        <textarea class="admin-textarea w-desc" rows="2">${escapeHtml(proj.desc || '')}</textarea>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Méta / Tags affichés</label>
          <input type="text" class="admin-input w-meta" value="${escapeAttr(proj.meta || '')}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Lien vers l'étude de cas</label>
          <input type="text" class="admin-input w-link" value="${escapeAttr(proj.link || '')}" />
        </div>
      </div>
    `

    card.querySelector('.w-name').addEventListener('input', (e) => {
      proj.name = e.target.value
      markDirty()
    })
    card.querySelector('.w-cat').addEventListener('input', (e) => {
      proj.cat = e.target.value
      markDirty()
    })
    card.querySelector('.w-desc').addEventListener('input', (e) => {
      proj.desc = e.target.value
      markDirty()
    })
    card.querySelector('.w-meta').addEventListener('input', (e) => {
      proj.meta = e.target.value
      markDirty()
    })
    card.querySelector('.w-link').addEventListener('input', (e) => {
      proj.link = e.target.value
      markDirty()
    })

    container.appendChild(card)
  })
}

function renderTestimonials() {
  const container = document.getElementById('testimonials-container')
  if (!container || !Array.isArray(currentContent.testimonials?.items)) return

  container.innerHTML = ''
  currentContent.testimonials.items.forEach((item) => {
    const card = document.createElement('div')
    card.className = 'admin-item-card'
    card.innerHTML = `
      <div class="admin-item-card__header">
        <h3>${escapeHtml(item.author || 'Client')} — ${escapeHtml(item.company || '')}</h3>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Citation / Avis</label>
        <textarea class="admin-textarea t-quote" rows="3">${escapeHtml(item.quote || '')}</textarea>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Nom de l'auteur</label>
          <input type="text" class="admin-input t-author" value="${escapeAttr(item.author || '')}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Rôle / Poste</label>
          <input type="text" class="admin-input t-role" value="${escapeAttr(item.role || '')}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Entreprise</label>
          <input type="text" class="admin-input t-company" value="${escapeAttr(item.company || '')}" />
        </div>
      </div>
    `

    card.querySelector('.t-quote').addEventListener('input', (e) => {
      item.quote = e.target.value
      markDirty()
    })
    card.querySelector('.t-author').addEventListener('input', (e) => {
      item.author = e.target.value
      markDirty()
    })
    card.querySelector('.t-role').addEventListener('input', (e) => {
      item.role = e.target.value
      markDirty()
    })
    card.querySelector('.t-company').addEventListener('input', (e) => {
      item.company = e.target.value
      markDirty()
    })

    container.appendChild(card)
  })
}

function renderFaq() {
  const container = document.getElementById('faq-items-container')
  if (!container || !Array.isArray(currentContent.faq?.items)) return

  container.innerHTML = ''
  currentContent.faq.items.forEach((item, index) => {
    const card = document.createElement('div')
    card.className = 'admin-item-card'
    card.innerHTML = `
      <div class="admin-item-card__header">
        <h3>Question #${index + 1}</h3>
        <button type="button" class="admin-btn admin-btn--danger btn-del-faq">Supprimer</button>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Intitulé de la question</label>
        <input type="text" class="admin-input faq-q" value="${escapeAttr(item.question || '')}" />
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Réponse détaillée</label>
        <textarea class="admin-textarea faq-a" rows="3">${escapeHtml(item.answer || '')}</textarea>
      </div>
    `

    card.querySelector('.faq-q').addEventListener('input', (e) => {
      item.question = e.target.value
      markDirty()
    })
    card.querySelector('.faq-a').addEventListener('input', (e) => {
      item.answer = e.target.value
      markDirty()
    })
    card.querySelector('.btn-del-faq').addEventListener('click', () => {
      currentContent.faq.items.splice(index, 1)
      renderFaq()
      markDirty()
    })

    container.appendChild(card)
  })
}

function initFaqActions() {
  const addBtn = document.getElementById('btn-add-faq')
  addBtn?.addEventListener('click', () => {
    if (!Array.isArray(currentContent.faq?.items)) {
      currentContent.faq.items = []
    }
    currentContent.faq.items.push({
      question: 'Nouvelle question ?',
      answer: 'Réponse à la question ici.'
    })
    renderFaq()
    markDirty()
  })
}

function renderCases() {
  const container = document.getElementById('cases-container')
  if (!container || !currentContent.cases) return

  container.innerHTML = ''
  Object.keys(currentContent.cases).forEach((key) => {
    const cs = currentContent.cases[key]
    const card = document.createElement('div')
    card.className = 'admin-item-card'
    card.innerHTML = `
      <div class="admin-item-card__header">
        <h3>Étude : ${escapeHtml(cs.client || key.toUpperCase())}</h3>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Nom du client</label>
          <input type="text" class="admin-input c-client" value="${escapeAttr(cs.client || '')}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Tag / Catégorie</label>
          <input type="text" class="admin-input c-tag" value="${escapeAttr(cs.tag || '')}" />
        </div>
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Titre héro (&lt;em&gt;mot&lt;/em&gt; pour dégradé)</label>
        <input type="text" class="admin-input c-title" value="${escapeAttr(cs.title || '')}" />
      </div>
      <div class="admin-form-group">
        <label class="admin-label">Accroche / Lead</label>
        <textarea class="admin-textarea c-lead" rows="2">${escapeHtml(cs.lead || '')}</textarea>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">KPI 1 (${escapeHtml(cs.metrics?.kpi1Label || 'KPI 1')})</label>
          <input type="text" class="admin-input c-kpi1" value="${escapeAttr(cs.metrics?.kpi1Val || '')}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-label">KPI 2 (${escapeHtml(cs.metrics?.kpi2Label || 'KPI 2')})</label>
          <input type="text" class="admin-input c-kpi2" value="${escapeAttr(cs.metrics?.kpi2Val || '')}" />
        </div>
      </div>
    `

    card.querySelector('.c-client').addEventListener('input', (e) => {
      cs.client = e.target.value
      markDirty()
    })
    card.querySelector('.c-tag').addEventListener('input', (e) => {
      cs.tag = e.target.value
      markDirty()
    })
    card.querySelector('.c-title').addEventListener('input', (e) => {
      cs.title = e.target.value
      markDirty()
    })
    card.querySelector('.c-lead').addEventListener('input', (e) => {
      cs.lead = e.target.value
      markDirty()
    })
    card.querySelector('.c-kpi1').addEventListener('input', (e) => {
      if (cs.metrics) cs.metrics.kpi1Val = e.target.value
      markDirty()
    })
    card.querySelector('.c-kpi2').addEventListener('input', (e) => {
      if (cs.metrics) cs.metrics.kpi2Val = e.target.value
      markDirty()
    })

    container.appendChild(card)
  })
}

// 5. Save actions & hotkey
function initSaveActions() {
  const saveBtn = document.getElementById('btn-save')
  saveBtn?.addEventListener('click', saveContent)

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      saveContent()
    }
  })
}

async function saveContent() {
  const saveBtn = document.getElementById('btn-save')
  if (saveBtn) {
    saveBtn.disabled = true
    saveBtn.innerHTML = `<span>Sauvegarde en cours...</span>`
  }

  try {
    const res = await fetch('/api/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentContent, null, 2)
    })

    if (res.ok) {
      markClean()
      showToast('Modifications enregistrées avec succès sur le disque !', 'success')
    } else {
      const err = await res.json()
      showToast(`Erreur lors de l'enregistrement: ${err.error}`, 'error')
    }
  } catch (err) {
    showToast(`Erreur réseau: ${err.message}`, 'error')
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false
      saveBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <span>Sauvegarder</span>
        <kbd class="admin-kbd">Ctrl+S</kbd>
      `
    }
  }
}

// 6. JSON Export / Import
function initJsonActions() {
  const downloadBtn = document.getElementById('btn-download-json')
  const importInput = document.getElementById('file-import-json')
  const applyBtn = document.getElementById('btn-apply-raw-json')

  downloadBtn?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentContent, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', 'site-content.json')
    dlAnchor.click()
    showToast('Fichier JSON téléchargé.', 'success')
  })

  importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        currentContent = parsed
        populateForm()
        updateRawJsonEditor()
        markDirty()
        showToast('Fichier JSON importé avec succès. Pensez à sauvegarder !', 'success')
      } catch (err) {
        showToast('Fichier JSON invalide: ' + err.message, 'error')
      }
    }
    reader.readAsText(file)
  })

  applyBtn?.addEventListener('click', () => {
    const rawEditor = document.getElementById('raw-json-editor')
    try {
      const parsed = JSON.parse(rawEditor.value)
      currentContent = parsed
      populateForm()
      markDirty()
      showToast('JSON brut appliqué à l’interface.', 'success')
    } catch (err) {
      showToast('Erreur de syntaxe JSON : ' + err.message, 'error')
    }
  })
}

function updateRawJsonEditor() {
  const rawEditor = document.getElementById('raw-json-editor')
  if (rawEditor) {
    rawEditor.value = JSON.stringify(currentContent, null, 2)
  }
}

// Dirty / Clean state tracker
function markDirty() {
  isDirty = true
  const statusEl = document.getElementById('admin-status')
  if (statusEl) {
    statusEl.classList.add('is-dirty')
    statusEl.querySelector('.admin-status__text').textContent = 'Modifications non enregistrées'
  }
}

function markClean() {
  isDirty = false
  const statusEl = document.getElementById('admin-status')
  if (statusEl) {
    statusEl.classList.remove('is-dirty')
    statusEl.querySelector('.admin-status__text').textContent = 'À jour'
  }
}

// Toast Notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container')
  if (!container) return

  const toast = document.createElement('div')
  toast.className = `admin-toast admin-toast--${type}`
  toast.innerHTML = `
    <span>${message}</span>
  `
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(10px)'
    toast.style.transition = 'all 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 3500)
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(str) {
  return String(str || '')
    .replace(/"/g, '&quot;')
}
