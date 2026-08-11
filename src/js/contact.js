export function initContactForm() {
  const form = document.querySelector('.contact__form')
  if (!form) return

  const note = form.querySelector('.contact__form-note')

  const setNote = (text, ok = false) => {
    if (!note) return
    note.textContent = text
    note.style.color = ok ? '#22d3ee' : '#f87171'
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    let valid = true
    form.querySelectorAll('[required]').forEach((field) => {
      const wrapper = field.closest('.field')
      const empty = !field.value.trim()
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

    const submitBtn = form.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.style.opacity = 0.6
    setNote('Envoi en cours…', true)

    setTimeout(() => {
      form.reset()
      submitBtn.disabled = false
      submitBtn.style.opacity = 1
      setNote('Merci ! Votre demande a bien été envoyée. Nous revenons vers vous sous 24h.', true)
    }, 900)
  })

  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      field.closest('.field').classList.remove('is-invalid')
    })
  })
}
