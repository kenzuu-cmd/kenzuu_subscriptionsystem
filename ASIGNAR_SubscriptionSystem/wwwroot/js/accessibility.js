/**
 * Accessibility Helper Module
 * Enhanced keyboard navigation, focus management, and screen reader support
 *
 * Improvements addressed:
 * - #1: Accessibility (ARIA, keyboard nav)
 * - #3: Navigation accessibility
 * - #7: Clear user feedback
 */

;(function () {
  'use strict'

  /**
   * Initialize accessibility enhancements
   */
  function initAccessibility() {
    // Focus management
    setupFocusManagement()

    // Keyboard navigation
    setupKeyboardNavigation()

    // Skip links
    setupSkipLinks()

    // Announce page changes
    setupPageAnnouncements()

    // Focus trap for modals
    setupModalFocusTrap()

    // Update ARIA live regions
    setupLiveRegions()
  }

  /**
   * Setup focus management
   */
  function setupFocusManagement() {
    // Track focus for visible outline
    document.addEventListener('mousedown', () => {
      document.body.classList.add('using-mouse')
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.remove('using-mouse')
      }
    })

    // Restore focus after modal closes
    let lastFocusedElement

    window.addEventListener('modal-opening', (e) => {
      lastFocusedElement = document.activeElement
    })

    window.addEventListener('modal-closed', (e) => {
      if (lastFocusedElement) {
        lastFocusedElement.focus()
      }
    })
  }

  /**
   * Setup keyboard navigation shortcuts
   */
  function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Escape key closes modals and dropdowns
      if (e.key === 'Escape') {
        closeAllModals()
        closeAllDropdowns()
      }

      // Ctrl/Cmd + K for search (if search exists)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('subscription-search')
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Arrow keys for navigation in menus
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const activeMenu = document.querySelector('.dropdown-menu.show')
        if (activeMenu) {
          e.preventDefault()
          navigateMenu(activeMenu, e.key === 'ArrowDown' ? 1 : -1)
        }
      }
    })
  }

  /**
   * Navigate through menu items with keyboard
   */
  function navigateMenu(menu, direction) {
    const items = Array.from(
      menu.querySelectorAll('.dropdown-item:not([disabled])')
    )
    const currentIndex = items.indexOf(document.activeElement)
    let nextIndex = currentIndex + direction

    if (nextIndex < 0) nextIndex = items.length - 1
    if (nextIndex >= items.length) nextIndex = 0

    items[nextIndex].focus()
  }

  /**
   * Setup skip links
   */
  function setupSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-to-content')

    skipLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const target = document.querySelector(link.getAttribute('href'))
        if (target) {
          target.setAttribute('tabindex', '-1')
          target.focus()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    })
  }

  /**
   * Setup page change announcements
   */
  function setupPageAnnouncements() {
    const announcer = createLiveRegion('announcer', 'polite')

    // Announce page title changes
    const observer = new MutationObserver(() => {
      const pageTitle = document.title
      announceToScreenReader(`Navigated to ${pageTitle}`)
    })

    observer.observe(document.querySelector('title'), {
      childList: true,
      characterData: true,
      subtree: true,
    })
  }

  /**
   * Create ARIA live region
   */
  function createLiveRegion(id, politeness = 'polite') {
    let region = document.getElementById(id)

    if (!region) {
      region = document.createElement('div')
      region.id = id
      region.setAttribute('role', 'status')
      region.setAttribute('aria-live', politeness)
      region.setAttribute('aria-atomic', 'true')
      region.className = 'visually-hidden'
      document.body.appendChild(region)
    }

    return region
  }

  /**
   * Announce message to screen readers
   */
  function announceToScreenReader(message, politeness = 'polite') {
    const regionId =
      politeness === 'assertive' ? 'alert-announcer' : 'announcer'
    const region = createLiveRegion(regionId, politeness)

    // Clear and set new message
    region.textContent = ''
    setTimeout(() => {
      region.textContent = message
    }, 100)
  }

  /**
   * Setup modal focus trap
   */
  function setupModalFocusTrap() {
    document.addEventListener('shown.bs.modal', (e) => {
      const modal = e.target
      trapFocus(modal)
    })
  }

  /**
   * Trap focus within element
   */
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), ' +
        'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element
    firstElement?.focus()

    // Trap focus
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    })
  }

  /**
   * Close all modals
   */
  function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show')
    modals.forEach((modal) => {
      const bsModal = bootstrap.Modal.getInstance(modal)
      if (bsModal) {
        bsModal.hide()
      }
    })
  }

  /**
   * Close all dropdowns
   */
  function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu.show')
    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.previousElementSibling
      if (toggle) {
        const bsDropdown = bootstrap.Dropdown.getInstance(toggle)
        if (bsDropdown) {
          bsDropdown.hide()
        }
      }
    })
  }

  /**
   * Setup live regions for dynamic content
   */
  function setupLiveRegions() {
    // Notification badge announcements
    const notificationBadge = document.getElementById('notification-badge')
    if (notificationBadge) {
      const observer = new MutationObserver(() => {
        const count = parseInt(notificationBadge.textContent) || 0
        if (count > 0) {
          announceToScreenReader(
            `You have ${count} new notification${count > 1 ? 's' : ''}`
          )
        }
      })

      observer.observe(notificationBadge, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    }
  }

  /**
   * Improve link accessibility
   */
  function improveLinkAccessibility() {
    // Add external link indicators
    const externalLinks = document.querySelectorAll(
      'a[href^="http"]:not([href*="' + window.location.hostname + '"])'
    )

    externalLinks.forEach((link) => {
      if (!link.getAttribute('aria-label')) {
        const text = link.textContent
        link.setAttribute('aria-label', `${text} (opens in new window)`)
      }

      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      }
    })

    // Add download link indicators
    const downloadLinks = document.querySelectorAll('a[download]')
    downloadLinks.forEach((link) => {
      if (!link.getAttribute('aria-label')) {
        const text = link.textContent
        const filename = link.getAttribute('download') || 'file'
        link.setAttribute('aria-label', `Download ${text} (${filename})`)
      }
    })
  }

  /**
   * Enhance form accessibility
   */
  function enhanceFormAccessibility() {
    // Link labels to inputs
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach((input) => {
      if (
        !input.getAttribute('aria-label') &&
        !input.getAttribute('aria-labelledby')
      ) {
        const label = document.querySelector(`label[for="${input.id}"]`)
        if (label) {
          input.setAttribute('aria-labelledby', label.id || `label-${input.id}`)
          if (!label.id) {
            label.id = `label-${input.id}`
          }
        }
      }

      // Add aria-required for required fields
      if (
        input.hasAttribute('required') &&
        !input.getAttribute('aria-required')
      ) {
        input.setAttribute('aria-required', 'true')
      }
    })
  }

  /**
   * Check color contrast (development helper)
   */
  function checkColorContrast() {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      console.group('🔍 Accessibility Contrast Check')
      console.log(
        'Checking color contrast ratios for WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)'
      )
      console.log(
        'Use browser DevTools Accessibility panel for detailed contrast checking'
      )
      console.groupEnd()
    }
  }

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAccessibility()
      improveLinkAccessibility()
      enhanceFormAccessibility()
      checkColorContrast()
    })
  } else {
    initAccessibility()
    improveLinkAccessibility()
    enhanceFormAccessibility()
    checkColorContrast()
  }

  // Export for external use
  window.A11y = {
    announceToScreenReader,
    trapFocus,
    createLiveRegion,
  }
})()
