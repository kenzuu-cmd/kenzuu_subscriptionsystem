/**
 * Form Validation Module
 * Real-time validation with accessibility support
 *
 * Improvements addressed:
 * - #2: User feedback with real-time validation
 * - #4: Accessibility with ARIA attributes
 * - #6: Consistent validation patterns
 */

;(function () {
  'use strict'

  /**
   * Initialize form validation
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]')

    forms.forEach((form) => {
      // Add novalidate to prevent browser validation
      form.setAttribute('novalidate', 'true')

      // Set up real-time validation for inputs
      const inputs = form.querySelectorAll('input, select, textarea')
      inputs.forEach((input) => {
        // Validate on blur
        input.addEventListener('blur', () => validateField(input))

        // Validate on input (with debounce for text inputs)
        if (
          input.type === 'text' ||
          input.type === 'email' ||
          input.type === 'number' ||
          input.tagName === 'TEXTAREA'
        ) {
          let timeout
          input.addEventListener('input', () => {
            clearTimeout(timeout)
            timeout = setTimeout(() => validateField(input), 500)
          })
        } else {
          input.addEventListener('change', () => validateField(input))
        }
      })

      // Validate on submit
      form.addEventListener('submit', (e) => {
        let isValid = true

        inputs.forEach((input) => {
          if (!validateField(input)) {
            isValid = false
          }
        })

        if (!isValid) {
          e.preventDefault()

          // Focus first invalid field
          const firstInvalid = form.querySelector('.is-invalid')
          if (firstInvalid) {
            firstInvalid.focus()

            // Scroll to field smoothly
            firstInvalid.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }

          // Show error notification
          showNotification('Please fix the errors in the form', 'error')
        } else {
          // Show loading state
          showLoadingState(form)
        }
      })
    })
  }

  /**
   * Validate individual field with PRIORITY-BASED error messages
   * Only shows ONE clear error at a time
   * @param {HTMLElement} field - Input field to validate
   * @returns {boolean} - Whether field is valid
   */
  function validateField(field) {
    // Skip disabled or readonly fields
    if (field.disabled || field.readOnly) {
      return true
    }

    const value = field.value.trim()
    const label = getLabelText(field)
    let isValid = true
    let errorMessage = ''

    // Clear previous validation state
    clearFieldValidation(field)

    // PRIORITY 1: Required validation (most critical)
    if (field.hasAttribute('required') && !value) {
      isValid = false
      errorMessage = `${label} is required`
    }

    // PRIORITY 2: Type-specific validation (only if field has value)
    else if (value) {
      switch (field.type) {
        case 'email':
          if (!isValidEmail(value)) {
            isValid = false
            errorMessage = 'Please enter a valid email address'
          }
          break

        case 'number':
          const min = field.getAttribute('min')
          const max = field.getAttribute('max')
          const numValue = parseFloat(value)

          if (isNaN(numValue)) {
            isValid = false
            errorMessage = 'Please enter a valid number'
          }
          // Show range error only if number is valid
          else if (
            min &&
            max &&
            (numValue < parseFloat(min) || numValue > parseFloat(max))
          ) {
            isValid = false
            // Show combined range for better UX
            errorMessage = `Amount must be between ₱${min} and ₱${max.toLocaleString()}`
          } else if (min && numValue < parseFloat(min)) {
            isValid = false
            errorMessage = `Minimum value is ₱${min}`
          } else if (max && numValue > parseFloat(max)) {
            isValid = false
            errorMessage = `Maximum value is ₱${max.toLocaleString()}`
          }
          break

        case 'date':
          if (!isValidDate(value)) {
            isValid = false
            errorMessage = 'Please enter a valid date'
          } else {
            // Check if date is in the future (for next payment date)
            const selectedDate = new Date(value)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (field.id === 'date-input' && selectedDate < today) {
              isValid = false
              errorMessage = 'Payment date must be today or in the future'
            }
          }
          break

        case 'url':
          if (!isValidURL(value)) {
            isValid = false
            errorMessage = 'Please enter a valid URL'
          }
          break
      }

      // PRIORITY 3: Pattern validation
      if (isValid) {
        const pattern = field.getAttribute('pattern')
        if (pattern && !new RegExp(pattern).test(value)) {
          isValid = false
          errorMessage =
            field.getAttribute('data-pattern-error') || 'Invalid format'
        }
      }

      // PRIORITY 4: Custom validation
      if (isValid) {
        const customValidation = field.getAttribute('data-validate-custom')
        if (customValidation && window[customValidation]) {
          const result = window[customValidation](value, field)
          if (result !== true) {
            isValid = false
            errorMessage = result
          }
        }
      }
    }

    // Apply validation state - ONLY ONE MESSAGE
    if (isValid) {
      setFieldValid(field)
    } else {
      setFieldInvalid(field, errorMessage)
    }

    return isValid
  }

  /**
   * Set field as valid - MINIMAL SUCCESS FEEDBACK
   */
  function setFieldValid(field) {
    field.classList.remove('is-invalid')
    field.classList.add('is-valid')
    field.setAttribute('aria-invalid', 'false')

    // Remove any existing error feedback
    const existingError = field.parentElement?.parentElement?.querySelector(
      '.feedback-message.error'
    )
    if (existingError) {
      existingError.remove()
    }

    // Don't show success messages for every field - reduces clutter
    // Only show if field was previously invalid
    // Success state is indicated by the subtle green border
  }

  /**
   * Set field as invalid with SINGLE CLEAR ERROR MESSAGE
   */
  function setFieldInvalid(field, message) {
    field.classList.remove('is-valid')
    field.classList.add('is-invalid')
    field.setAttribute('aria-invalid', 'true')

    // Find the form group container
    const formGroup = field.closest('.form-group-modern') || field.parentElement

    // Remove ALL existing feedback messages to prevent duplicates
    const existingFeedback = formGroup.querySelectorAll('.feedback-message')
    existingFeedback.forEach((fb) => fb.remove())

    // Create ONE new error message
    const feedbackId = `${field.id || field.name}-error`
    const feedback = createFeedbackElement(feedbackId, 'error')
    feedback.innerHTML = `<i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i><span>${message}</span>`
    feedback.setAttribute('role', 'alert')

    // Insert after the input wrapper or input itself
    const insertAfter =
      field.parentElement.classList.contains('input-group-modern') ||
      field.parentElement.classList.contains('currency-input-wrapper')
        ? field.parentElement
        : field

    // Check if there's an input-hint to insert after
    const hint = formGroup.querySelector('.input-hint')
    if (hint) {
      hint.after(feedback)
    } else {
      insertAfter.after(feedback)
    }

    // Update aria-describedby (once, not twice)
    field.setAttribute('aria-describedby', feedbackId)
  }

  /**
   * Clear field validation state completely
   */
  function clearFieldValidation(field) {
    field.classList.remove('is-valid', 'is-invalid')
    field.removeAttribute('aria-invalid')

    // Find and remove all feedback messages in this form group
    const formGroup = field.closest('.form-group-modern') || field.parentElement
    const feedbacks = formGroup?.querySelectorAll('.feedback-message')
    feedbacks?.forEach((fb) => fb.remove())

    // Reset aria-describedby to only include hints if present
    const hint = formGroup?.querySelector('.input-hint')
    if (hint && hint.id) {
      field.setAttribute('aria-describedby', hint.id)
    } else {
      field.removeAttribute('aria-describedby')
    }
  }

  /**
   * Create feedback element
   */
  function createFeedbackElement(id, type) {
    const feedback = document.createElement('div')
    feedback.id = id
    feedback.className = `feedback-message ${type}`
    feedback.setAttribute('aria-live', 'polite')
    return feedback
  }

  /**
   * Get label text for field
   */
  function getLabelText(field) {
    const label = document.querySelector(`label[for="${field.id}"]`)
    if (label) {
      return label.textContent.replace('*', '').trim()
    }
    return field.getAttribute('placeholder') || field.name || 'This field'
  }

  /**
   * Validation helper functions
   */
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  function isValidDate(dateString) {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date)
  }

  function isValidURL(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Show loading state on form
   */
  function showLoadingState(form) {
    const submitBtn = form.querySelector('button[type="submit"]')
    if (submitBtn) {
      submitBtn.disabled = true

      // Store original content
      submitBtn.setAttribute('data-original-text', submitBtn.innerHTML)

      // Show loading spinner
      submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span>Processing...</span>
            `

      // Add loading class
      submitBtn.classList.add('loading')
    }
  }

  /**
   * Show notification message
   */
  function showNotification(message, type = 'info') {
    // Use existing notification system if available
    if (window.SubscriptionUI && window.SubscriptionUI.showNotification) {
      window.SubscriptionUI.showNotification(message, type)
      return
    }

    // Fallback: Create simple notification
    const notification = document.createElement('div')
    notification.className = `alert alert-${
      type === 'error' ? 'danger' : type
    } position-fixed top-0 start-50 translate-middle-x mt-3`
    notification.style.zIndex = '9999'
    notification.setAttribute('role', 'alert')
    notification.innerHTML = `
            <i class="bi bi-${
              type === 'error' ? 'exclamation-circle' : 'info-circle'
            } me-2"></i>
            ${message}
        `

    document.body.appendChild(notification)

    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transition = 'opacity 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }, 4000)
  }

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormValidation)
  } else {
    initFormValidation()
  }

  // Export for external use
  window.FormValidation = {
    validateField,
    initFormValidation,
    showNotification,
  }
})()
