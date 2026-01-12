/* Real-time Form Validation for Auth Pages */
;(function () {
  'use strict'

  // Email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Password validation pattern (min 6, uppercase, lowercase, digit)
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/

  // Validate email field
  function validateEmail(input) {
    const value = input.value.trim()
    const errorSpan = document.getElementById(
      input.getAttribute('aria-describedby')
    )

    if (!value) {
      showError(input, errorSpan, 'Email is required')
      return false
    }

    if (!emailPattern.test(value)) {
      showError(input, errorSpan, 'Please enter a valid email address')
      return false
    }

    showSuccess(input, errorSpan)
    return true
  }

  // Validate password field
  function validatePassword(input, isNew = false) {
    const value = input.value
    const errorSpan = document.getElementById(
      input.getAttribute('aria-describedby')
    )

    if (!value) {
      showError(input, errorSpan, 'Password is required')
      return false
    }

    if (isNew && !passwordPattern.test(value)) {
      showError(
        input,
        errorSpan,
        'Password must be at least 6 characters with uppercase, lowercase, and number'
      )
      return false
    }

    showSuccess(input, errorSpan)
    return true
  }

  // Validate password confirmation
  function validateConfirmPassword(input, passwordInput) {
    const value = input.value
    const passwordValue = passwordInput.value
    const errorSpan = document.getElementById(
      input.getAttribute('aria-describedby')
    )

    if (!value) {
      showError(input, errorSpan, 'Please confirm your password')
      return false
    }

    if (value !== passwordValue) {
      showError(input, errorSpan, 'Passwords do not match')
      return false
    }

    showSuccess(input, errorSpan)
    return true
  }

  // Show error state
  function showError(input, errorSpan, message) {
    input.classList.add('is-invalid')
    input.classList.remove('is-valid')
    input.style.borderColor = 'rgba(239, 68, 68, 0.5)'
    if (errorSpan) {
      errorSpan.textContent = message
      errorSpan.style.display = 'block'
    }
  }

  // Show success state
  function showSuccess(input, errorSpan) {
    input.classList.remove('is-invalid')
    input.classList.add('is-valid')
    input.style.borderColor = 'rgba(34, 197, 94, 0.5)'
    if (errorSpan) {
      errorSpan.textContent = ''
      errorSpan.style.display = 'none'
    }
  }

  // Clear validation state
  function clearValidation(input, errorSpan) {
    input.classList.remove('is-invalid', 'is-valid')
    input.style.borderColor = ''
    if (errorSpan) {
      errorSpan.textContent = ''
      errorSpan.style.display = 'none'
    }
  }

  // Initialize validation on page load
  document.addEventListener('DOMContentLoaded', function () {
    // Find auth forms
    const loginForm = document.getElementById('account')
    const registerForm = document.getElementById('registerForm')

    // Login form validation
    if (loginForm) {
      const emailInput = loginForm.querySelector('input[type="email"]')
      const passwordInput = loginForm.querySelector('input[type="password"]')

      if (emailInput) {
        emailInput.addEventListener('input', () => validateEmail(emailInput))
        emailInput.addEventListener('blur', () => validateEmail(emailInput))
        emailInput.focus()
      }

      if (passwordInput) {
        passwordInput.addEventListener('blur', () =>
          validatePassword(passwordInput, false)
        )
      }

      loginForm.addEventListener('submit', function (e) {
        let isValid = true

        if (emailInput && !validateEmail(emailInput)) {
          isValid = false
        }

        if (passwordInput && !passwordInput.value) {
          const errorSpan = document.getElementById(
            passwordInput.getAttribute('aria-describedby')
          )
          showError(passwordInput, errorSpan, 'Password is required')
          isValid = false
        }

        if (!isValid) {
          e.preventDefault()
        }
      })
    }

    // Register form validation
    if (registerForm) {
      const emailInput = registerForm.querySelector('input[name="Input.Email"]')
      const passwordInput = registerForm.querySelector(
        'input[name="Input.Password"]'
      )
      const confirmPasswordInput = registerForm.querySelector(
        'input[name="Input.ConfirmPassword"]'
      )
      const submitBtn = registerForm.querySelector('button[type="submit"]')

      if (emailInput) {
        emailInput.addEventListener('input', () => {
          validateEmail(emailInput)
          updateSubmitButton()
        })
        emailInput.addEventListener('blur', () => validateEmail(emailInput))
        emailInput.focus()
      }

      if (passwordInput) {
        passwordInput.addEventListener('input', () => {
          validatePassword(passwordInput, true)
          if (confirmPasswordInput && confirmPasswordInput.value) {
            validateConfirmPassword(confirmPasswordInput, passwordInput)
          }
          updateSubmitButton()
        })
        passwordInput.addEventListener('blur', () =>
          validatePassword(passwordInput, true)
        )
      }

      if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
          validateConfirmPassword(confirmPasswordInput, passwordInput)
          updateSubmitButton()
        })
        confirmPasswordInput.addEventListener('blur', () =>
          validateConfirmPassword(confirmPasswordInput, passwordInput)
        )
      }

      function updateSubmitButton() {
        if (submitBtn) {
          const emailValid = emailInput ? validateEmail(emailInput) : false
          const passwordValid = passwordInput
            ? validatePassword(passwordInput, true)
            : false
          const confirmValid = confirmPasswordInput
            ? validateConfirmPassword(confirmPasswordInput, passwordInput)
            : true

          submitBtn.disabled = !(emailValid && passwordValid && confirmValid)
        }
      }

      if (submitBtn) {
        submitBtn.disabled = true
      }

      registerForm.addEventListener('submit', function (e) {
        let isValid = true

        if (emailInput && !validateEmail(emailInput)) {
          isValid = false
        }

        if (passwordInput && !validatePassword(passwordInput, true)) {
          isValid = false
        }

        if (
          confirmPasswordInput &&
          !validateConfirmPassword(confirmPasswordInput, passwordInput)
        ) {
          isValid = false
        }

        if (!isValid) {
          e.preventDefault()
        }
      })
    }
  })
})()
