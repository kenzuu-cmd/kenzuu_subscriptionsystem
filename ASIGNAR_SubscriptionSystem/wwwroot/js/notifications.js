/**
 * Notification Center - Enhanced for Modern SaaS UX
 * Features: Priority sorting, accessibility, animations, keyboard navigation
 * @version 3.0.0
 */

;(function (window) {
  'use strict'

  const NOTIFICATIONS_KEY = 'subscriptionSystem_notifications'
  const MAX_NOTIFICATIONS = 50

  const NotificationCenter = {
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    focusedIndex: -1,

    /**
     * Initialize notification center
     */
    init: function () {
      this.load()
      this.checkUpcomingPayments()
      this.render()
      this.setupEventListeners()

      // Check for new notifications every 5 minutes
      setInterval(() => {
        this.checkUpcomingPayments()
      }, 5 * 60 * 1000)

      // Listen for subscription changes
      window.addEventListener('subscriptionAdded', () =>
        this.checkUpcomingPayments()
      )
      window.addEventListener('subscriptionUpdated', () =>
        this.checkUpcomingPayments()
      )
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function () {
      const button = document.getElementById('notification-button')
      const dropdown = document.getElementById('notification-dropdown')

      if (button) {
        button.addEventListener('click', (e) => {
          e.stopPropagation()
          this.toggle()
        })

        button.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            this.toggle()
          }
        })
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isOpen && !e.target.closest('.notification-container')) {
          this.close()
        }
      })

      // Keyboard navigation
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

      // Delegated event handling for notification actions
      if (dropdown) {
        dropdown.addEventListener('click', (e) => {
          const action = e.target.closest('[data-action]')?.dataset.action
          const id = e.target.closest('[data-id]')?.dataset.id

          if (action === 'mark-read' && id) {
            this.markAsRead(id)
          } else if (action === 'delete' && id) {
            this.remove(id)
          } else if (action === 'mark-all-read') {
            this.markAllAsRead()
          } else if (action === 'clear-all') {
            this.clearAll()
          }
        })
      }
    },

    /**
     * Toggle dropdown
     */
    toggle: function () {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },

    /**
     * Open dropdown
     */
    open: function () {
      const dropdown = document.getElementById('notification-dropdown')
      const button = document.getElementById('notification-button')

      if (!dropdown || !button) return

      dropdown.classList.add('show')
      button.setAttribute('aria-expanded', 'true')
      button.classList.add('has-notifications')
      this.isOpen = true

      // Animate badge
      const badge = document.getElementById('notification-badge')
      if (badge) {
        badge.classList.add('show')
      }
    },

    /**
     * Close dropdown
     */
    close: function () {
      const dropdown = document.getElementById('notification-dropdown')
      const button = document.getElementById('notification-button')

      if (!dropdown || !button) return

      dropdown.classList.remove('show')
      button.setAttribute('aria-expanded', 'false')
      button.classList.remove('has-notifications')
      this.isOpen = false
      this.focusedIndex = -1
    },

    /**
     * Navigate to next item
     */
    navigateDown: function () {
      const items = document.querySelectorAll('.notification-item')
      if (items.length === 0) return

      this.focusedIndex = (this.focusedIndex + 1) % items.length
      items[this.focusedIndex]?.focus()
    },

    /**
     * Navigate to previous item
     */
    navigateUp: function () {
      const items = document.querySelectorAll('.notification-item')
      if (items.length === 0) return

      this.focusedIndex =
        this.focusedIndex <= 0 ? items.length - 1 : this.focusedIndex - 1
      items[this.focusedIndex]?.focus()
    },

    /**
     * Load notifications from localStorage
     */
    load: function () {
      try {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY)
        if (stored) {
          this.notifications = JSON.parse(stored)
          this.updateUnreadCount()
        }
      } catch (e) {
        console.error('Failed to load notifications:', e)
        this.notifications = []
      }
    },

    /**
     * Save notifications to localStorage
     */
    save: function () {
      try {
        if (this.notifications.length > MAX_NOTIFICATIONS) {
          this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS)
        }
        localStorage.setItem(
          NOTIFICATIONS_KEY,
          JSON.stringify(this.notifications)
        )
      } catch (e) {
        console.error('Failed to save notifications:', e)
      }
    },

    /**
     * Add a notification
     */
    add: function (notification) {
      // Check for duplicates
      const exists = this.notifications.some(
        (n) =>
          n.type === notification.type &&
          n.subscriptionId === notification.subscriptionId &&
          n.message === notification.message
      )

      if (exists) return

      const newNotification = {
        id: 'notif-' + Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification,
      }

      this.notifications.unshift(newNotification)
      this.sortByPriority()
      this.updateUnreadCount()
      this.save()
      this.render()

      // Trigger bell animation
      const button = document.getElementById('notification-button')
      if (button) {
        button.classList.add('has-notifications')
        setTimeout(() => button.classList.remove('has-notifications'), 500)
      }

      // Show toast for high priority
      if (notification.priority === 'high') {
        window.SubscriptionUI?.showNotification(
          notification.message,
          notification.type || 'warning'
        )
      }
    },

    /**
     * Sort notifications by priority
     */
    sortByPriority: function () {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      this.notifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1
        return (
          (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
        )
      })
    },

    /**
     * Mark notification as read
     */
    markAsRead: function (id) {
      const notification = this.notifications.find((n) => n.id === id)
      if (notification && !notification.read) {
        notification.read = true
        this.updateUnreadCount()
        this.save()
        this.render()
      }
    },

    /**
     * Mark all as read
     */
    markAllAsRead: function () {
      this.notifications.forEach((n) => (n.read = true))
      this.updateUnreadCount()
      this.save()
      this.render()
    },

    /**
     * Remove notification
     */
    remove: function (id) {
      this.notifications = this.notifications.filter((n) => n.id !== id)
      this.updateUnreadCount()
      this.save()
      this.render()
    },

    /**
     * Clear all notifications
     */
    clearAll: function () {
      if (confirm('Clear all notifications?')) {
        this.notifications = []
        this.updateUnreadCount()
        this.save()
        this.render()
      }
    },

    /**
     * Update unread count
     */
    updateUnreadCount: function () {
      this.unreadCount = this.notifications.filter((n) => !n.read).length
    },

    /**
     * Check for upcoming payments and generate notifications
     */
    checkUpcomingPayments: function () {
      if (!window.SubscriptionManager) return

      const subscriptions = window.SubscriptionManager.getAll()
      const today = new Date()

      subscriptions.forEach((sub) => {
        if (sub.status !== 'active') return

        const paymentDate = new Date(sub.nextPaymentDate)
        const daysUntil = Math.ceil(
          (paymentDate - today) / (1000 * 60 * 60 * 24)
        )

        // Payment overdue - Highest priority
        if (daysUntil < 0) {
          this.add({
            type: 'error',
            icon: 'bi-exclamation-circle-fill',
            title: 'Payment Overdue',
            message: `${sub.serviceName} payment is overdue!`,
            subscriptionId: sub.id,
            priority: 'high',
          })
        }
        // Payment due today
        else if (daysUntil === 0) {
          this.add({
            type: 'error',
            icon: 'bi-calendar-x',
            title: 'Payment Due Today',
            message: `${sub.serviceName} payment of $${sub.price} is due today`,
            subscriptionId: sub.id,
            priority: 'high',
          })
        }
        // Payment due tomorrow
        else if (daysUntil === 1) {
          this.add({
            type: 'warning',
            icon: 'bi-calendar-event',
            title: 'Payment Tomorrow',
            message: `${sub.serviceName} payment of $${sub.price} due tomorrow`,
            subscriptionId: sub.id,
            priority: 'high',
          })
        }
        // Payment due in 3 days
        else if (daysUntil === 3) {
          this.add({
            type: 'warning',
            icon: 'bi-bell',
            title: 'Payment Coming Soon',
            message: `${sub.serviceName} payment of $${sub.price} due in 3 days`,
            subscriptionId: sub.id,
            priority: 'medium',
          })
        }

        // Trial ending soon
        if (sub.status === 'trial' && sub.trialEndsDate) {
          const trialDate = new Date(sub.trialEndsDate)
          const trialDays = Math.ceil(
            (trialDate - today) / (1000 * 60 * 60 * 24)
          )

          if (trialDays === 7) {
            this.add({
              type: 'info',
              icon: 'bi-clock-history',
              title: 'Trial Ending Soon',
              message: `${sub.serviceName} trial ends in 7 days`,
              subscriptionId: sub.id,
              priority: 'medium',
            })
          } else if (trialDays === 1) {
            this.add({
              type: 'warning',
              icon: 'bi-clock-history',
              title: 'Trial Ends Tomorrow',
              message: `${sub.serviceName} trial ends tomorrow`,
              subscriptionId: sub.id,
              priority: 'high',
            })
          }
        }
      })
    },

    /**
     * Render notification center
     */
    render: function () {
      this.renderBadge()
      this.renderDropdown()
    },

    /**
     * Render notification badge
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
     * Render dropdown content
     */
    renderDropdown: function () {
      const dropdown = document.getElementById('notification-dropdown')
      if (!dropdown) return

      if (this.notifications.length === 0) {
        dropdown.innerHTML = `
                    <div class="notification-empty">
                        <div class="notification-empty-icon">
                            <i class="bi bi-bell-slash"></i>
                        </div>
                        <p>No notifications yet</p>
                        <small>We'll notify you about upcoming payments</small>
                    </div>
                `
        return
      }

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
     * Render single notification item
     */
    renderNotificationItem: function (notification) {
      const iconTypeMap = {
        error: 'icon-error',
        warning: 'icon-warning',
        success: 'icon-success',
        info: 'icon-info',
      }

      const iconClass = iconTypeMap[notification.type] || 'icon-info'
      const timeAgo = this.getTimeAgo(notification.timestamp)
      const priorityClass = notification.priority
        ? `priority-${notification.priority}`
        : ''

      return `
                <div class="notification-item ${
                  notification.read ? '' : 'unread'
                } ${priorityClass}" 
                     data-id="${notification.id}"
                     role="listitem"
                     tabindex="0"
                     aria-label="${notification.title}: ${
        notification.message
      }">
                    <div class="notification-icon ${iconClass}">
                        <i class="bi ${
                          notification.icon || 'bi-bell-fill'
                        }"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${
                          notification.title || 'Notification'
                        }</div>
                        <div class="notification-message">${
                          notification.message
                        }</div>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                    <div class="notification-controls">
                        ${
                          !notification.read
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
     * Get relative time string
     */
    getTimeAgo: function (timestamp) {
      const now = new Date()
      const then = new Date(timestamp)
      const seconds = Math.floor((now - then) / 1000)

      if (seconds < 60) return 'Just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
      return then.toLocaleDateString()
    },
  }

  // Initialize on page load
  window.addEventListener('DOMContentLoaded', () => {
    NotificationCenter.init()
  })

  // Export to window
  window.NotificationCenter = NotificationCenter
})(window)
