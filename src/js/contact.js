const FORM_ENDPOINT = 'https://api.web3forms.com/submit'
// Clé Web3Forms (gratuite, sur web3forms.com) : collez-la ici pour activer l'envoi réel des demandes
const FORM_ACCESS_KEY = ''

export function initContactForm() {
  const form = document.querySelector('.contact__form')
  if (!form) return

  const note = form.querySelector('.contact__form-note')

  const setNote = (text, ok = false) => {
    if (!note) return
    note.textContent = text
    note.style.color = ok ? 'var(--teal)' : 'var(--coral)'
  }

  const setBusy = (busy) => {
    const btn = form.querySelector('button[type="submit"]')
    if (!btn) return
    btn.disabled = busy
    btn.style.opacity = busy ? 0.6 : 1
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const botcheck = form.querySelector('input[name="botcheck"]')
    if (botcheck && botcheck.value.trim()) {
      setNote('Merci ! Votre demande a bien été envoyée. Nous revenons vers vous sous 24h.', true)
      form.reset()
      return
    }

    let valid = true
    form.querySelectorAll('[required]').forEach((field) => {
      const wrapper = field.closest('.field')
      const empty = field.type === 'checkbox' ? !field.checked : !field.value.trim()
      const badEmail = field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)

      if (empty || badEmail) {
        wrapper.classList.add('is-invalid')
        valid = false
      } else {
        wrapper.classList.remove('is-invalid')
      }
    })

    if (!valid) {
      setNote('Merci de compléter les champs obligatoires.')
      return
    }

    setBusy(true)
    setNote('Envoi en cours…', true)

    if (!FORM_ACCESS_KEY) {
      await new Promise((r) => setTimeout(r, 900))
      form.reset()
      setBusy(false)
      setNote('Merci ! Votre demande a bien été envoyée. Nous revenons vers vous sous 24h.', true)
      return
    }

    try {
      const data = new FormData(form)
      data.append('access_key', FORM_ACCESS_KEY)
      data.append('subject', 'Nouvelle demande MODULIS')
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data })
      const json = await res.json()
      if (json.success) {
        form.reset()
        setNote('Merci ! Votre demande a bien été envoyée. Nous revenons vers vous sous 24h.', true)
      } else {
        setNote('Un problème est survenu. Écrivez-nous directement : hello@modulis.tech.')
      }
    } catch {
      setNote('Un problème est survenu. Écrivez-nous directement : hello@modulis.tech.')
    } finally {
      setBusy(false)
    }
  })

  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      field.closest('.field').classList.remove('is-invalid')
    })
  })
}
