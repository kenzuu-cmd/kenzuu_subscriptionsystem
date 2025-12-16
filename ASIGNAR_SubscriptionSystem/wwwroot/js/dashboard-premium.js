/**
 * Premium Dashboard Functionality
 * Enhanced interactivity and animations for subscription management
 * @version 1.0.0
 */

;(function () {
  'use strict'

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const state = {
    subscriptions: [],
    filteredSubscriptions: [],
    currentFilter: 'all',
    currentSort: 'date',
    searchTerm: '',
    bulkSelectMode: false,
    selectedSubscriptions: new Set(),
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  document.addEventListener('DOMContentLoaded', function () {
    initializeSubscriptions()
    initializeFilterChips()
    initializeSearch()
    initializeSortButtons()
    initializeBulkActions()
    animateStatCards()
    setupProgressRing()
    initializeReminders()
    setupQuickActions()
  })

  function initializeSubscriptions() {
    const rows = document.querySelectorAll('#subscriptions-table tbody tr')
    state.subscriptions = Array.from(rows).map((row) => {
      const nameEl = row.querySelector('.fw-bold.text-white')
      const priceEl = row.querySelector('[data-label="Price"]')
      const cycleEl = row.querySelector('[data-label="Billing Cycle"]')
      const dateEl = row.querySelector('[data-label="Next Payment"]')

      return {
        element: row,
        name: nameEl ? nameEl.textContent.trim() : '',
        price: priceEl
          ? parseFloat(priceEl.textContent.replace('$', '').replace(',', ''))
          : 0,
        cycle: cycleEl ? cycleEl.textContent.trim() : '',
        date: dateEl
          ? dateEl.querySelector('.text-white, .text-danger')
            ? dateEl
                .querySelector('.text-white, .text-danger')
                .textContent.trim()
            : ''
          : '',
        category: row.querySelector('.small.text-muted')
          ? row.querySelector('.small.text-muted').textContent.trim()
          : '',
        status: getSubscriptionStatus(row),
      }
    })
    state.filteredSubscriptions = [...state.subscriptions]
  }

  function getSubscriptionStatus(row) {
    const dateEl = row.querySelector('[data-label="Next Payment"]')
    if (!dateEl) return 'active'

    const isUrgent = dateEl.querySelector('.text-danger')
    if (isUrgent) {
      const text = isUrgent.textContent.toLowerCase()
      if (text.includes('overdue')) return 'expired'
      if (text.includes('today') || text.includes('tomorrow')) return 'urgent'
    }

    return 'active'
  }

  // ========================================
  // FILTERING
  // ========================================

  function initializeFilterChips() {
    const filterChips = document.querySelectorAll('.filter-chip')

    filterChips.forEach((chip) => {
      chip.addEventListener('click', function () {
        // Update active state
        filterChips.forEach((c) => c.classList.remove('active'))
        this.classList.add('active')

        // Apply filter
        state.currentFilter = this.dataset.filter
        applyFilters()

        // Animate filtered results
        animateTableRows()
      })
    })
  }

  function applyFilters() {
    state.filteredSubscriptions = state.subscriptions.filter((sub) => {
      // Apply status filter
      if (state.currentFilter !== 'all' && sub.status !== state.currentFilter) {
        return false
      }

      // Apply search filter
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase()
        return (
          sub.name.toLowerCase().includes(searchLower) ||
          sub.category.toLowerCase().includes(searchLower)
        )
      }

      return true
    })

    updateTableVisibility()
    updateStatistics()
  }

  function updateTableVisibility() {
    state.subscriptions.forEach((sub) => {
      if (state.filteredSubscriptions.includes(sub)) {
        sub.element.style.display = ''
      } else {
        sub.element.style.display = 'none'
      }
    })

    showEmptyState()
  }

  function showEmptyState() {
    const tbody = document.querySelector('#subscriptions-table tbody')
    const existingEmpty = tbody.querySelector('.empty-state-row')

    if (state.filteredSubscriptions.length === 0) {
      if (!existingEmpty) {
        const emptyRow = document.createElement('tr')
        emptyRow.className = 'empty-state-row'
        emptyRow.innerHTML = `
                    <td colspan="5" class="text-center py-5">
                        <i class="bi bi-search fs-1 text-muted d-block mb-3"></i>
                        <p class="text-muted mb-0">No subscriptions found matching your criteria.</p>
                        <button class="btn btn-sm btn-link text-primary" onclick="resetFilters()">Reset filters</button>
                    </td>
                `
        tbody.appendChild(emptyRow)
      }
    } else {
      if (existingEmpty) {
        existingEmpty.remove()
      }
    }
  }

  // ========================================
  // SEARCH
  // ========================================

  function initializeSearch() {
    const searchInput = document.getElementById('subscription-search')
    if (!searchInput) return

    let debounceTimer
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        state.searchTerm = this.value.trim()
        applyFilters()
        animateTableRows()
      }, 300)
    })
  }

  // ========================================
  // SORTING
  // ========================================

  function initializeSortButtons() {
    const sortButtons = document.querySelectorAll('[data-sort]')

    sortButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const sortType = this.dataset.sort

        // Toggle sort direction if clicking same button
        if (state.currentSort === sortType) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc'
        } else {
          state.currentSort = sortType
          state.sortDirection = 'asc'
        }

        sortSubscriptions(sortType)
        animateTableRows()

        // Update button UI
        sortButtons.forEach((btn) => btn.classList.remove('active'))
        this.classList.add('active')
      })
    })
  }

  function sortSubscriptions(sortType) {
    state.filteredSubscriptions.sort((a, b) => {
      let comparison = 0

      switch (sortType) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'date':
          comparison = a.date.localeCompare(b.date)
          break
      }

      return state.sortDirection === 'desc' ? -comparison : comparison
    })

    // Reorder DOM elements
    const tbody = document.querySelector('#subscriptions-table tbody')
    state.filteredSubscriptions.forEach((sub) => {
      tbody.appendChild(sub.element)
    })
  }

  // ========================================
  // BULK ACTIONS
  // ========================================

  function initializeBulkActions() {
    const bulkToggleBtn = document.getElementById('bulk-toggle-btn')
    if (!bulkToggleBtn) return

    bulkToggleBtn.addEventListener('click', function () {
      state.bulkSelectMode = !state.bulkSelectMode

      if (state.bulkSelectMode) {
        enableBulkMode()
      } else {
        disableBulkMode()
      }
    })
  }

  function enableBulkMode() {
    // Add checkboxes to table
    const tbody = document.querySelector('#subscriptions-table tbody')
    const rows = tbody.querySelectorAll('tr:not(.empty-state-row)')

    rows.forEach((row) => {
      const firstCell = row.querySelector('td')
      if (firstCell && !firstCell.querySelector('.bulk-checkbox')) {
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'bulk-checkbox form-check-input me-3'
        checkbox.addEventListener('change', handleCheckboxChange)

        firstCell.insertBefore(checkbox, firstCell.firstChild)
      }
    })

    // Show bulk action bar
    showBulkActionBar()
  }

  function disableBulkMode() {
    // Remove checkboxes
    document.querySelectorAll('.bulk-checkbox').forEach((cb) => cb.remove())

    // Hide bulk action bar
    hideBulkActionBar()

    // Clear selections
    state.selectedSubscriptions.clear()
  }

  function handleCheckboxChange(event) {
    const row = event.target.closest('tr')
    const subId = row.dataset.subscriptionId

    if (event.target.checked) {
      state.selectedSubscriptions.add(subId)
    } else {
      state.selectedSubscriptions.delete(subId)
    }

    updateBulkActionBar()
  }

  function showBulkActionBar() {
    let bar = document.querySelector('.bulk-action-bar')
    if (!bar) {
      bar = document.createElement('div')
      bar.className = 'bulk-action-bar'
      bar.innerHTML = `
                <div class="d-flex align-items-center justify-content-between p-3">
                    <span class="bulk-count">0 selected</span>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-danger" onclick="bulkDelete()">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="bulkPause()">
                            <i class="bi bi-pause"></i> Pause
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="bulkExport()">
                            <i class="bi bi-download"></i> Export
                        </button>
                    </div>
                </div>
            `
      document.querySelector('.glass-card').appendChild(bar)
    }
    bar.style.display = 'block'
  }

  function hideBulkActionBar() {
    const bar = document.querySelector('.bulk-action-bar')
    if (bar) bar.style.display = 'none'
  }

  function updateBulkActionBar() {
    const countSpan = document.querySelector('.bulk-count')
    if (countSpan) {
      countSpan.textContent = `${state.selectedSubscriptions.size} selected`
    }
  }

  // ========================================
  // ANIMATIONS
  // ========================================

  function animateStatCards() {
    const cards = document.querySelectorAll('.stat-card')
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`
      card.classList.add('fade-in-up')
    })

    // Animate numbers
    animateCounter('stat-monthly')
    animateCounter('stat-count')
    animateCounter('stat-yearly')
  }

  function animateCounter(elementId) {
    const element = document.getElementById(elementId)
    if (!element) return

    const target = parseFloat(
      element.dataset.target || element.textContent.trim().replace(/[₱$,]/g, '')
    )
    if (isNaN(target)) return

    const hasCurrency =
      element.textContent.includes('₱') || element.dataset.target
    const duration = 2000
    const steps = 60
    const stepValue = target / steps
    const stepDuration = duration / steps

    let currentValue = 0
    let step = 0

    const counter = setInterval(() => {
      currentValue += stepValue
      step++

      if (hasCurrency) {
        element.textContent =
          '₱' + Math.floor(currentValue).toLocaleString('en-PH')
      } else {
        element.textContent = Math.floor(currentValue).toLocaleString('en-PH')
      }

      if (step >= steps) {
        if (hasCurrency) {
          element.textContent = '₱' + target.toLocaleString('en-PH')
        } else {
          element.textContent = target.toLocaleString('en-PH')
        }
        clearInterval(counter)
      }
    }, stepDuration)
  }

  function animateTableRows() {
    const rows = document.querySelectorAll(
      '#subscriptions-table tbody tr:not([style*="display: none"])'
    )
    rows.forEach((row, index) => {
      row.style.opacity = '0'
      row.style.transform = 'translateY(10px)'

      setTimeout(() => {
        row.style.transition = 'all 0.3s ease'
        row.style.opacity = '1'
        row.style.transform = 'translateY(0)'
      }, index * 50)
    })
  }

  // ========================================
  // PROGRESS RING
  // ========================================

  function setupProgressRing() {
    const ring = document.querySelector('.progress-ring-circle')
    if (!ring) return

    const radius = ring.r.baseVal.value
    const circumference = radius * 2 * Math.PI

    ring.style.strokeDasharray = `${circumference} ${circumference}`
    ring.style.strokeDashoffset = circumference

    // Animate to target percentage (example: 75%)
    setTimeout(() => {
      const percent = 75
      const offset = circumference - (percent / 100) * circumference
      ring.style.strokeDashoffset = offset
    }, 500)
  }

  // ========================================
  // REMINDERS
  // ========================================

  function initializeReminders() {
    const reminderActions = document.querySelectorAll('.reminder-actions .btn')

    reminderActions.forEach((btn) => {
      btn.addEventListener('click', function () {
        const reminderItem = this.closest('.reminder-item')
        reminderItem.style.transition = 'all 0.3s ease'
        reminderItem.style.opacity = '0'
        reminderItem.style.transform = 'translateX(-20px)'

        setTimeout(() => {
          reminderItem.remove()
        }, 300)
      })
    })
  }

  // ========================================
  // QUICK ACTIONS
  // ========================================

  function setupQuickActions() {
    const quickActions = document.querySelectorAll('.quick-action-btn')

    quickActions.forEach((action) => {
      action.addEventListener('click', function (e) {
        e.preventDefault()

        // Add ripple effect
        const ripple = document.createElement('span')
        ripple.className = 'ripple'
        this.appendChild(ripple)

        setTimeout(() => ripple.remove(), 600)
      })
    })
  }

  // ========================================
  // STATISTICS UPDATE
  // ========================================

  function updateStatistics() {
    const totalMonthly = state.filteredSubscriptions.reduce(
      (sum, sub) => sum + sub.price,
      0
    )
    const count = state.filteredSubscriptions.length
    const yearlyProjected = totalMonthly * 12

    document.getElementById('stat-monthly').textContent =
      '$' + totalMonthly.toLocaleString()
    document.getElementById('stat-count').textContent = count
    document.getElementById('stat-yearly').textContent =
      '$' + yearlyProjected.toLocaleString()
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  window.resetFilters = function () {
    state.currentFilter = 'all'
    state.searchTerm = ''
    document.getElementById('subscription-search').value = ''

    const filterChips = document.querySelectorAll('.filter-chip')
    filterChips.forEach((chip) => chip.classList.remove('active'))
    document.querySelector('[data-filter="all"]').classList.add('active')

    applyFilters()
    animateTableRows()
  }

  window.bulkDelete = function () {
    if (state.selectedSubscriptions.size === 0) return

    if (confirm(`Delete ${state.selectedSubscriptions.size} subscriptions?`)) {
      state.selectedSubscriptions.forEach((id) => {
        const row = document.querySelector(`[data-subscription-id="${id}"]`)
        if (row) row.remove()
      })

      state.selectedSubscriptions.clear()
      disableBulkMode()
      initializeSubscriptions()
    }
  }

  window.bulkPause = function () {
    console.log('Pausing', state.selectedSubscriptions.size, 'subscriptions')
    // Implement pause logic
  }

  window.bulkExport = function () {
    console.log('Exporting', state.selectedSubscriptions.size, 'subscriptions')
    // Implement export logic
  }
})()
