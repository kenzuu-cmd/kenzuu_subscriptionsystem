/**
 * Premium Reports with Animated Chart.js Charts
 * @version 2.0.0
 */

;(function () {
  'use strict'

  // Chart color palette
  const colors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  }

  // Global chart configuration
  Chart.defaults.color = '#9ca3af'
  Chart.defaults.font.family =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  Chart.defaults.font.size = 12

  // State
  const state = {
    dateRange: 'last6months',
    charts: {},
    data: null,
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function () {
    console.log('Initializing Reports...')
    state.data = generateMockData()
    initializeDateRangeSelector()
    initializeAllCharts()
    setupExportButtons()
    initializeSearch()
  })

  // ========================================
  // DATE RANGE SELECTOR
  // ========================================

  function initializeDateRangeSelector() {
    const buttons = document.querySelectorAll('[data-date-range]')

    buttons.forEach((button) => {
      button.addEventListener('click', function () {
        // Remove active from all
        buttons.forEach((btn) => btn.classList.remove('active'))
        // Add active to clicked
        this.classList.add('active')

        // Update state and regenerate data
        state.dateRange = this.dataset.dateRange
        state.data = generateMockData()
        updateAllCharts()
      })
    })
  }

  // ========================================
  // CHART INITIALIZATION
  // ========================================

  function initializeAllCharts() {
    initializeSpendingTrendChart()
    initializeCategoryPieChart()
    initializeTopSubscriptionsChart()
  }

  function initializeSpendingTrendChart() {
    const canvas = document.getElementById('spending-trend-chart')
    if (!canvas) {
      console.error('Spending trend chart canvas not found')
      return
    }

    const ctx = canvas.getContext('2d')

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 350)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)')
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)')

    state.charts.spendingTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: state.data.months,
        datasets: [
          {
            label: 'Monthly Spending',
            data: state.data.spending,
            borderColor: colors.primary,
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: colors.primary,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: colors.primary,
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart',
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#d1d5db',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return (
                  '₱' +
                  context.parsed.y.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                )
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 11,
                weight: '500',
              },
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 11,
                weight: '500',
              },
              callback: function (value) {
                return '₱' + value.toLocaleString('en-PH')
              },
            },
          },
        },
      },
    })

    console.log('Spending trend chart initialized')
  }

  function initializeCategoryPieChart() {
    const canvas = document.getElementById('category-pie-chart')
    if (!canvas) {
      console.error('Category pie chart canvas not found')
      return
    }

    const ctx = canvas.getContext('2d')

    state.charts.categoryPie = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: state.data.categories,
        datasets: [
          {
            data: state.data.categorySpending,
            backgroundColor: [
              colors.primary,
              colors.accent,
              colors.success,
              colors.warning,
              colors.info,
            ],
            borderColor: '#000000',
            borderWidth: 3,
            hoverOffset: 15,
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart',
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#d1d5db',
              font: {
                size: 12,
                weight: '600',
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#d1d5db',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const label = context.label || ''
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ₱${value.toLocaleString(
                  'en-PH'
                )} (${percentage}%)`
              },
            },
          },
        },
        cutout: '65%',
      },
    })

    console.log('Category pie chart initialized')
  }

  function initializeTopSubscriptionsChart() {
    const canvas = document.getElementById('top-subs-chart')
    if (!canvas) {
      console.error('Top subscriptions chart canvas not found')
      return
    }

    const ctx = canvas.getContext('2d')

    state.charts.topSubs = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: state.data.topSubscriptions,
        datasets: [
          {
            label: 'Monthly Cost',
            data: state.data.topSubscriptionsCost,
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 0,
            borderRadius: 8,
            barThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart',
          delay: function (context) {
            return context.dataIndex * 100
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#d1d5db',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return (
                  '₱' +
                  context.parsed.x.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                )
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 11,
                weight: '500',
              },
              callback: function (value) {
                return '₱' + value.toLocaleString('en-PH')
              },
            },
            beginAtZero: true,
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#d1d5db',
              font: {
                size: 12,
                weight: '600',
              },
            },
          },
        },
      },
    })

    console.log('Top subscriptions chart initialized')
  }

  // ========================================
  // DATA GENERATION
  // ========================================

  function generateMockData() {
    const monthCount =
      state.dateRange === 'last3months'
        ? 3
        : state.dateRange === 'last6months'
        ? 6
        : 12

    const months = []
    const spending = []
    const currentDate = new Date()

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      )
      months.push(
        date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      )
      // Generate realistic spending data with some trend
      const baseSpending = 300
      const trend = i * 15 // Increasing trend
      const variance = Math.random() * 100
      spending.push(Math.floor(baseSpending + trend + variance))
    }

    return {
      months,
      spending,
      categories: ['Streaming', 'Software', 'Cloud Storage', 'Gaming', 'Other'],
      categorySpending: [180, 299, 89, 49, 67],
      topSubscriptions: ['Adobe CC', 'Netflix', 'Spotify', 'Figma', 'GitHub'],
      topSubscriptionsCost: [2799, 599, 299, 750, 200],
    }
  }

  // ========================================
  // CHART UPDATES
  // ========================================

  function updateAllCharts() {
    // Update spending trend
    if (state.charts.spendingTrend) {
      state.charts.spendingTrend.data.labels = state.data.months
      state.charts.spendingTrend.data.datasets[0].data = state.data.spending
      state.charts.spendingTrend.update('active')
    }

    // Category and top subs don't change with date range, but we could add that logic
    console.log('Charts updated for date range:', state.dateRange)
  }

  // ========================================
  // EXPORT FUNCTIONALITY
  // ========================================

  function setupExportButtons() {
    const exportButtons = document.querySelectorAll('[data-export-chart]')

    exportButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const chartName = this.dataset.exportChart
        exportChart(chartName)
      })
    })
  }

  function exportChart(chartName) {
    const chart = state.charts[chartName]
    if (!chart) {
      console.error('Chart not found:', chartName)
      return
    }

    // Convert chart to image
    const url = chart.toBase64Image()

    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = `${chartName}-${Date.now()}.png`
    link.click()

    showNotification('Chart exported successfully!', 'success')
  }

  // CSV Export
  window.exportDataToCSV = function () {
    let csv = 'Month,Spending\n'
    state.data.months.forEach((month, index) => {
      csv += `${month},${state.data.spending[index]}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscription-report-${Date.now()}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    showNotification('Report exported successfully!', 'success')
  }

  // ========================================
  // NOTIFICATIONS
  // ========================================

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <i class="bi bi-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `
    notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            padding: 1rem 1.5rem;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `

    document.body.appendChild(notification)

    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateX(0)'
    }, 100)

    // Fade out and remove
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateX(100px)'
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  function getNotificationIcon(type) {
    const icons = {
      success: 'check-circle-fill',
      error: 'x-circle-fill',
      warning: 'exclamation-triangle-fill',
      info: 'info-circle-fill',
    }
    return icons[type] || icons.info
  }

  // ========================================
  // SEARCH FUNCTIONALITY
  // ========================================

  function initializeSearch() {
    const searchInput = document.getElementById('subscription-search-reports')
    if (!searchInput) return

    let searchTimeout

    searchInput.addEventListener('input', function (e) {
      const searchTerm = e.target.value.toLowerCase().trim()

      // Debounce search for better performance
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        filterSubscriptions(searchTerm)
      }, 300)
    })

    // Add clear button functionality
    searchInput.addEventListener('search', function (e) {
      if (e.target.value === '') {
        filterSubscriptions('')
      }
    })
  }

  function filterSubscriptions(searchTerm) {
    const table = document.querySelector('.subscription-table tbody')
    if (!table) return

    const rows = table.querySelectorAll('tr')
    let visibleCount = 0

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase()
      const isMatch = text.includes(searchTerm)

      if (isMatch) {
        row.style.display = ''
        visibleCount++
      } else {
        row.style.display = 'none'
      }
    })

    // Update footer count
    updateTableFooter(visibleCount, rows.length)

    // Announce to screen readers
    if (window.A11y && window.A11y.announceToScreenReader) {
      const message =
        visibleCount === 0
          ? 'No subscriptions found'
          : `Showing ${visibleCount} of ${rows.length} subscriptions`
      window.A11y.announceToScreenReader(message, 'polite')
    }
  }

  function updateTableFooter(visibleCount, totalCount) {
    const footerText = document.querySelector('.table-card-footer span')
    if (footerText) {
      footerText.textContent = `Showing ${visibleCount} of ${totalCount} subscriptions`
    }
  }

  // Add notification content styles
  const style = document.createElement('style')
  style.textContent = `
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: #ffffff;
            font-weight: 600;
            font-size: 0.9375rem;
        }
        
        .notification-content i {
            font-size: 1.25rem;
        }
        
        .notification-success .notification-content i {
            color: #10b981;
        }
        
        .notification-error .notification-content i {
            color: #ef4444;
        }
        
        .notification-warning .notification-content i {
            color: #f59e0b;
        }
        
        .notification-info .notification-content i {
            color: #3b82f6;
        }
    `
  document.head.appendChild(style)
})()
