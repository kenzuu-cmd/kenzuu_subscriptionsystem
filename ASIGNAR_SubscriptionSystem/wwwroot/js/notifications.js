/**
 * Notification Center - Database-Driven Version
 * Loads all notifications from live database via API endpoint
 * Features: Real-time updates, accessibility, animations, keyboard navigation
 * 
 * CHANGE INTENT: Fix notification panel not appearing and not fetching data
 * - Ensure panel opens/closes on bell icon click
 * - Fetch notifications from database API
 * - Display notifications with proper styling
 * - Handle empty state and errors gracefully
 * 
 * @version 4.1.0 - Fixed initialization and panel visibility
 */

;(function (window) {
  'use strict'

  // API endpoint for fetching notifications from database
  const API_ENDPOINT = '/Api/Notifications'
  const REFRESH_INTERVAL = 60000 // Refresh every 60 seconds

  const NotificationCenter = {
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    focusedIndex: -1,
    refreshTimer: null,

    /**
     * Initialize notification center
     * Called automatically when page loads
     */
    init: function () {
      console.log('NotificationCenter: Initializing...')
      
      // Setup event listeners first
      this.setupEventListeners()
      
      // Load initial data from database
      this.loadFromDatabase()
      
      // Start automatic refresh timer
      this.startAutoRefresh()

      console.log('NotificationCenter: Initialized successfully')
    },

    /**
     * Load notifications from database via API
     * This is called when panel opens and periodically for refresh
     */
    loadFromDatabase: async function () {
      try {
        console.log('NotificationCenter: Fetching notifications from database...')
        
        // Fetch notifications from backend API
        const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'same-origin'
        })

        // Handle HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        // Parse JSON response
        const data = await response.json()

        if (data.success) {
          // Store notifications data
          this.notifications = data.notifications || []
          this.unreadCount = data.unreadCount || 0
          
          // Update UI with fetched data
          this.render()
          
          console.log(
            `NotificationCenter: Loaded ${this.notifications.length} notifications (${this.unreadCount} unread)`
          )
        } else {
          // API returned error
          console.error('NotificationCenter: API error:', data.error)
          this.showDatabaseError(data.error || 'Unknown error occurred')
        }
      } catch (error) {
        // Network or parsing error
        console.error('NotificationCenter: Failed to fetch notifications:', error)
        this.showDatabaseError('Unable to connect to notification service')
      }
    },

    /**
     * Start automatic refresh timer
     * Periodically fetches new notifications in background
     */
    startAutoRefresh: function () {
      // Clear any existing timer
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
      }

      // Refresh notifications every REFRESH_INTERVAL milliseconds
      this.refreshTimer = setInterval(() => {
        this.loadFromDatabase()
      }, REFRESH_INTERVAL)
      
      console.log(`NotificationCenter: Auto-refresh started (every ${REFRESH_INTERVAL/1000}s)`)
    },

    /**
     * Stop automatic refresh
     * Called on page unload
     */
    stopAutoRefresh: function () {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
        console.log('NotificationCenter: Auto-refresh stopped')
      }
    },

    /**
     * Setup event listeners for button clicks and keyboard navigation
     * CRITICAL: This makes the notification button actually work
     */
    setupEventListeners: function () {
      const button = document.getElementById('notification-button')
      const dropdown = document.getElementById('notification-dropdown')

      if (!button) {
        console.error('NotificationCenter: notification-button not found!')
        return
      }

      if (!dropdown) {
        console.error('NotificationCenter: notification-dropdown not found!')
        return
      }

      // Click handler - toggles panel open/close
      button.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggle()
      })

      // Keyboard accessibility - Enter or Space to toggle
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.toggle()
        }
      })

      // Close panel when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && !e.target.closest('.notification-container')) {
          this.close()
        }
      })

      // Keyboard navigation within panel
      document.addEventListener('keydown', (e) => {
        if (!this.isOpen) return

        if (e.key === 'Escape') {
          this.close()
          button?.focus()
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          this.navigateDown()
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          this.navigateUp()
        }
      })

      // Delegated event handling for notification actions (mark read, delete, etc.)
      dropdown.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action
        const id = e.target.closest('[data-id]')?.dataset.id

        if (action === 'mark-read' && id) {
          this.markAsRead(parseInt(id))
        } else if (action === 'delete' && id) {
          this.remove(parseInt(id))
        } else if (action === 'mark-all-read') {
          this.markAllAsRead()
        } else if (action === 'clear-all') {
          this.clearAll()
        }
      })
      
      console.log('NotificationCenter: Event listeners attached successfully')
    },

    /**
     * Toggle notification panel open/close
     */
    toggle: function () {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },

    /**
     * Open notification panel
     * Refetches data to ensure it's up-to-date
     */
    open: function () {
      const dropdown = document.getElementById('notification-dropdown')
      const button = document.getElementById('notification-button')

      if (!dropdown || !button) {
        console.error('NotificationCenter: Cannot open - elements not found')
        return
      }

      // Add 'show' class to make panel visible (triggers CSS transition)
      dropdown.classList.add('show')
      button.setAttribute('aria-expanded', 'true')
      this.isOpen = true

      // Refresh data when panel opens
      this.loadFromDatabase()
      
      console.log('NotificationCenter: Panel opened')
    },

    /**
     * Close notification panel
     */
    close: function () {
      const dropdown = document.getElementById('notification-dropdown')
      const button = document.getElementById('notification-button')

      if (!dropdown || !button) return

      // Remove 'show' class to hide panel (triggers CSS transition)
      dropdown.classList.remove('show')
      button.setAttribute('aria-expanded', 'false')
      this.isOpen = false
      this.focusedIndex = -1
      
      console.log('NotificationCenter: Panel closed')
    },

    /**
     * Navigate to next notification item (keyboard navigation)
     */
    navigateDown: function () {
      const items = document.querySelectorAll('.notification-item')
      if (items.length === 0) return

      this.focusedIndex = (this.focusedIndex + 1) % items.length
      items[this.focusedIndex]?.focus()
    },

    /**
     * Navigate to previous notification item (keyboard navigation)
     */
    navigateUp: function () {
      const items = document.querySelectorAll('.notification-item')
      if (items.length === 0) return

      this.focusedIndex =
        this.focusedIndex <= 0 ? items.length - 1 : this.focusedIndex - 1
      items[this.focusedIndex]?.focus()
    },

    /**
     * Mark notification as read via API
     */
    markAsRead: async function (id) {
      try {
        const response = await fetch(`${API_ENDPOINT}?handler=MarkRead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': this.getAntiForgeryToken()
          },
          credentials: 'same-origin',
          body: JSON.stringify({ id: id })
        })

        const data = await response.json()

        if (data.success) {
          // Refresh to show updated state
          await this.loadFromDatabase()
        } else {
          console.error('Failed to mark notification as read:', data.error)
        }
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    },

    /**
     * Mark all notifications as read via API
     */
    markAllAsRead: async function () {
      try {
        const response = await fetch(`${API_ENDPOINT}?handler=MarkAllRead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': this.getAntiForgeryToken()
          },
          credentials: 'same-origin'
        })

        const data = await response.json()

        if (data.success) {
          // Refresh to show updated state
          await this.loadFromDatabase()
        } else {
          console.error('Failed to mark all as read:', data.error)
        }
      } catch (error) {
        console.error('Error marking all as read:', error)
      }
    },

    /**
     * Remove/delete notification via API
     */
    remove: async function (id) {
      try {
        const response = await fetch(`${API_ENDPOINT}?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': this.getAntiForgeryToken()
          },
          credentials: 'same-origin'
        })

        const data = await response.json()

        if (data.success) {
          // Refresh to show updated state
          await this.loadFromDatabase()
        } else {
          console.error('Failed to delete notification:', data.error)
        }
      } catch (error) {
        console.error('Error deleting notification:', error)
      }
    },

    /**
     * Clear all notifications via API
     */
    clearAll: async function () {
      if (!confirm('Clear all notifications? This action cannot be undone.')) {
        return
      }

      try {
        const response = await fetch(`${API_ENDPOINT}?handler=ClearAll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': this.getAntiForgeryToken()
          },
          credentials: 'same-origin'
        })

        const data = await response.json()

        if (data.success) {
          // Refresh to show cleared state
          await this.loadFromDatabase()
        } else {
          console.error('Failed to clear notifications:', data.error)
        }
      } catch (error) {
        console.error('Error clearing notifications:', error)
      }
    },

    /**
     * Get anti-forgery token for POST/DELETE requests
     * Required by ASP.NET Core for CSRF protection
     */
    getAntiForgeryToken: function () {
      const tokenElement = document.querySelector(
        'input[name="__RequestVerificationToken"]'
      )
      return tokenElement ? tokenElement.value : ''
    },

    /**
     * Show error state in panel when database fetch fails
     */
    showDatabaseError: function (errorMessage) {
      // Clear notifications and counts
      this.notifications = []
      this.unreadCount = 0
      
      // Update badge
      this.renderBadge()

      // Show error message in panel
      const dropdown = document.getElementById('notification-dropdown')
      if (dropdown) {
        dropdown.innerHTML = `
          <div class="notification-empty">
            <div class="notification-empty-icon text-warning">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <p>Could not load notifications</p>
            <small>${this.escapeHtml(errorMessage)}</small>
            <button class="btn btn-sm btn-primary mt-3" onclick="window.NotificationCenter.loadFromDatabase()">
              <i class="bi bi-arrow-clockwise me-1"></i> Retry
            </button>
          </div>
        `
      }
    },

    /**
     * Render both badge and dropdown
     */
    render: function () {
      this.renderBadge()
      this.renderDropdown()
    },

    /**
     * Render notification badge (the red circle with count)
     */
    renderBadge: function () {
      const badge = document.getElementById('notification-badge')
      if (!badge) return

      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount
        badge.classList.add('show')
        badge.setAttribute(
          'aria-label',
          `${this.unreadCount} unread notifications`
        )
      } else {
        badge.classList.remove('show')
      }
    },

    /**
     * Render dropdown panel content
     * Shows either notifications list or empty state
     */
    renderDropdown: function () {
      const dropdown = document.getElementById('notification-dropdown')
      if (!dropdown) return

      // Empty state - no notifications
      if (this.notifications.length === 0) {
        dropdown.innerHTML = `
          <div class="notification-empty">
            <div class="notification-empty-icon">
              <i class="bi bi-bell-slash"></i>
            </div>
            <p>No new notifications</p>
            <small>You'll be notified about upcoming payments and important updates</small>
          </div>
        `
        return
      }

      // Build notification list HTML
      const html = `
        <div class="notification-header">
          <h6>Notifications</h6>
          <div class="notification-actions">
            ${
              this.unreadCount > 0
                ? `<button class="btn-text" data-action="mark-all-read" aria-label="Mark all as read">Mark all read</button>`
                : ''
            }
            <button class="btn-text text-danger" data-action="clear-all" aria-label="Clear all notifications">Clear all</button>
          </div>
        </div>
        <div class="notification-list" role="list">
          ${this.notifications
            .map((n) => this.renderNotificationItem(n))
            .join('')}
        </div>
      `

      dropdown.innerHTML = html
    },

    /**
     * Render a single notification item
     * Includes icon, title, message, time, and action buttons
     */
    renderNotificationItem: function (notification) {
      // Map notification type to icon color class
      const iconTypeMap = {
        error: 'icon-error',
        warning: 'icon-warning',
        success: 'icon-success',
        info: 'icon-info',
      }

      const iconClass = iconTypeMap[notification.type] || 'icon-info'
      const priorityClass = notification.priority
        ? `priority-${notification.priority}`
        : ''

      return `
        <div class="notification-item ${
          notification.isRead ? '' : 'unread'
        } ${priorityClass}" 
             data-id="${notification.id}"
             role="listitem"
             tabindex="0"
             aria-label="${this.escapeHtml(notification.title)}: ${this.escapeHtml(
        notification.message
      )}">
          <div class="notification-icon ${iconClass}">
            <i class="bi ${notification.icon || 'bi-bell-fill'}"></i>
          </div>
          <div class="notification-content">
            <div class="notification-title">${this.escapeHtml(
              notification.title || 'Notification'
            )}</div>
            <div class="notification-message">${this.escapeHtml(
              notification.message
            )}</div>
            <div class="notification-time">${this.escapeHtml(
              notification.timeAgo
            )}</div>
          </div>
          <div class="notification-controls">
            ${
              !notification.isRead
                ? `
            <button class="btn-icon" 
                    data-action="mark-read" 
                    data-id="${notification.id}" 
                    title="Mark as read"
                    aria-label="Mark as read">
              <i class="bi bi-check2"></i>
            </button>`
                : ''
            }
            <button class="btn-icon" 
                    data-action="delete" 
                    data-id="${notification.id}" 
                    title="Delete"
                    aria-label="Delete notification">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      `
    },

    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml: function (text) {
      if (!text) return ''
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    },
  }

  // Initialize notification center when page loads
  window.addEventListener('DOMContentLoaded', () => {
    NotificationCenter.init()
  })

  // Cleanup when page unloads
  window.addEventListener('beforeunload', () => {
    NotificationCenter.stopAutoRefresh()
  })

  // Export to window for global access
  window.NotificationCenter = NotificationCenter
})(window)
