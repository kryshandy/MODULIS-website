const WA_NUMBER = '237678239636'

const PACK_LABELS = {
  standard: 'Pack Standard (PVC)',
  premium: 'Pack Premium (Bois / Métal)',
  equipe: 'Pack Équipe (PME)'
}

const PACK_MATERIALS = {
  standard: ['PVC Mat', 'PVC Brillant'],
  premium: ['Bois', 'Métal'],
  equipe: ['PVC Mat', 'PVC Brillant', 'Bois', 'Métal']
}

function updateMaterialOptions(packSelect, materialSelect, preferred) {
  const pack = packSelect.value
  const options = PACK_MATERIALS[pack] || PACK_MATERIALS.standard
  const keep = preferred && options.includes(preferred) ? preferred : options[0]

  materialSelect.innerHTML = options
    .map((m) => `<option value="${m}"${m === keep ? ' selected' : ''}>${m}</option>`)
    .join('')
}

function setActivePack(packButtons, packKey) {
  packButtons.forEach((btn) => {
    const active = btn.dataset.pack === packKey
    btn.classList.toggle('is-active', active)
    btn.setAttribute('aria-pressed', active ? 'true' : 'false')
  })
}

function buildWhatsAppMessage(form) {
  const data = new FormData(form)
  const pack = data.get('pack')
  const lines = [
    '🛒 *Réservation carte NFC Modulis Tech*',
    '',
    `*Pack :* ${PACK_LABELS[pack] || pack}`,
    `*Matière :* ${data.get('material')}`,
    '',
    '*Profil digital*',
    `• Nom : ${data.get('name')}`,
    `• Poste : ${data.get('title')}`,
    `• Téléphone : ${data.get('phone')}`,
    `• WhatsApp : ${data.get('whatsapp')}`
  ]

  const linkedin = String(data.get('linkedin') || '').trim()
  const website = String(data.get('website') || '').trim()
  const message = String(data.get('message') || '').trim()

  if (linkedin) lines.push(`• LinkedIn : ${linkedin}`)
  if (website) lines.push(`• Site web : ${website}`)
  if (message) {
    lines.push('', `*Message :* ${message}`)
  }

  lines.push(
    '',
    '_Logo / design : à envoyer en pièce jointe dans cette conversation._'
  )

  return lines.join('\n')
}

export function initNfcOrder() {
  const form = document.querySelector('#nfc-order-form')
  if (!form) return

  const packSelect = form.querySelector('#nfc-pack')
  const materialSelect = form.querySelector('#nfc-material')
  const note = form.querySelector('.contact__form-note')
  const packButtons = document.querySelectorAll('.nfc-pack[data-pack]')

  const setNote = (text, ok = false) => {
    if (!note) return
    note.textContent = text
    note.style.color = ok ? 'var(--teal)' : 'var(--coral)'
  }

  packSelect.addEventListener('change', () => {
    updateMaterialOptions(packSelect, materialSelect)
    setActivePack(packButtons, packSelect.value)
  })

  packButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pack = btn.dataset.pack
      packSelect.value = pack
      updateMaterialOptions(packSelect, materialSelect)
      setActivePack(packButtons, pack)

      const target = document.querySelector('#reserver')
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    let valid = true
    form.querySelectorAll('[required]').forEach((field) => {
      const wrapper = field.closest('.field')
      const empty = field.type === 'checkbox' ? !field.checked : !String(field.value || '').trim()
      if (empty) {
        wrapper?.classList.add('is-invalid')
        valid = false
      } else {
        wrapper?.classList.remove('is-invalid')
      }
    })

    if (!valid) {
      setNote('Merci de compléter les champs obligatoires.')
      return
    }

    const text = buildWhatsAppMessage(form)
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
    setNote('Ouverture de WhatsApp…', true)
    window.open(url, '_blank', 'noopener')
  })
}
