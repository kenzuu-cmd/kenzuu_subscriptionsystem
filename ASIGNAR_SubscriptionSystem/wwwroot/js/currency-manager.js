/**
 * Currency Manager
 * Centralized currency preference management with reactive updates
 * 
 * CHANGE INTENT: Fix currency symbol bugs and enable reactive currency changes
 * - Manages currency preference in localStorage
 * - Provides currency symbols and formatting
 * - Broadcasts currency changes to all pages
 * - Updates all currency displays in real-time
 * 
 * @version 1.0.0
 */

;(function (window) {
  'use strict'

  // Currency configuration
  const CURRENCIES = {
    PHP: { symbol: '₱', name: 'Philippine Peso', code: 'PHP' },
    USD: { symbol: '$', name: 'United States Dollar', code: 'USD' },
    EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
    GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
    JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  }

  const STORAGE_KEY = 'user_currency_preference'
  const DEFAULT_CURRENCY = 'PHP'

  /**
   * Currency Manager Class
   * Handles all currency-related operations
   */
  class CurrencyManager {
    constructor() {
      this.currentCurrency = this.loadCurrency()
      this.listeners = []
    }

    /**
     * Load currency preference from localStorage
     * @returns {string} Currency code
     */
    loadCurrency() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved && CURRENCIES[saved] ? saved : DEFAULT_CURRENCY
      } catch (e) {
        console.warn('Failed to load currency preference:', e)
        return DEFAULT_CURRENCY
      }
    }

    /**
     * Save currency preference to localStorage
     * @param {string} currencyCode - ISO currency code
     * @returns {boolean} Success status
     */
    saveCurrency(currencyCode) {
      if (!CURRENCIES[currencyCode]) {
        console.error('Invalid currency code:', currencyCode)
        return false
      }

      try {
        localStorage.setItem(STORAGE_KEY, currencyCode)
        this.currentCurrency = currencyCode
        this.notifyListeners(currencyCode)
        return true
      } catch (e) {
        console.error('Failed to save currency preference:', e)
        return false
      }
    }

    /**
     * Get current currency code
     * @returns {string} Currency code
     */
    getCurrency() {
      return this.currentCurrency
    }

    /**
     * Get currency symbol for current or specified currency
     * @param {string} [currencyCode] - Optional currency code
     * @returns {string} Currency symbol
     */
    getSymbol(currencyCode = null) {
      const code = currencyCode || this.currentCurrency
      return CURRENCIES[code]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol
    }

    /**
     * Get currency name
     * @param {string} [currencyCode] - Optional currency code
     * @returns {string} Currency name
     */
    getName(currencyCode = null) {
      const code = currencyCode || this.currentCurrency
      return CURRENCIES[code]?.name || CURRENCIES[DEFAULT_CURRENCY].name
    }

    /**
     * Get all supported currencies
     * @returns {Object} Currencies object
     */
    getAllCurrencies() {
      return CURRENCIES
    }

    /**
     * Format amount with currency symbol
     * @param {number} amount - Amount to format
     * @param {string} [currencyCode] - Optional currency code
     * @returns {string} Formatted amount
     */
    formatAmount(amount, currencyCode = null) {
      const symbol = this.getSymbol(currencyCode)
      const value = parseFloat(amount) || 0
      return `${symbol}${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }

    /**
     * Register a listener for currency changes
     * @param {Function} callback - Callback function(currencyCode)
     */
    onChange(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback)
      }
    }

    /**
     * Notify all listeners of currency change
     * @param {string} currencyCode - New currency code
     */
    notifyListeners(currencyCode) {
      this.listeners.forEach((callback) => {
        try {
          callback(currencyCode)
        } catch (e) {
          console.error('Error in currency change listener:', e)
        }
      })
    }

    /**
     * Update all currency displays on the page
     * @param {string} [currencyCode] - Optional specific currency
     */
    updateAllDisplays(currencyCode = null) {
      const code = currencyCode || this.currentCurrency
      const symbol = this.getSymbol(code)

      // Update elements with data-currency attribute
      document.querySelectorAll('[data-currency]').forEach((el) => {
        el.textContent = symbol
      })

      // Update currency input symbols
      document.querySelectorAll('.currency-symbol').forEach((el) => {
        el.textContent = symbol
      })

      // Update aria-labels for accessibility
      document.querySelectorAll('[aria-label*="Philippine Peso"]').forEach((el) => {
        const currentLabel = el.getAttribute('aria-label')
        const newLabel = currentLabel.replace(/Philippine Peso|United States Dollar|Euro|British Pound|Japanese Yen/g, this.getName(code))
        el.setAttribute('aria-label', newLabel)
      })

      // Update hint texts
      document.querySelectorAll('.input-hint').forEach((el) => {
        if (el.textContent.includes('Philippine Peso') || el.textContent.includes('?')) {
          el.innerHTML = el.innerHTML.replace(
            /Philippine Peso|United States Dollar|Euro|British Pound|Japanese Yen|\?/g,
            this.getName(code)
          )
          el.innerHTML = el.innerHTML.replace(/\?/g, symbol)
        }
      })

      console.log(`Currency displays updated to ${code} (${symbol})`)
    }

    /**
     * Initialize currency on page load
     */
    initialize() {
      // Update displays on load
      this.updateAllDisplays()

      // Listen for storage changes from other tabs
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          this.currentCurrency = e.newValue
          this.updateAllDisplays()
          this.notifyListeners(e.newValue)
        }
      })

      console.log(`Currency Manager initialized with ${this.currentCurrency}`)
    }
  }

  // Create global instance
  const currencyManager = new CurrencyManager()

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      currencyManager.initialize()
    })
  } else {
    currencyManager.initialize()
  }

  // Expose to window
  window.CurrencyManager = currencyManager

  // Backwards compatibility
  window.getCurrencySymbol = () => currencyManager.getSymbol()
  window.formatCurrency = (amount) => currencyManager.formatAmount(amount)
})(window)
