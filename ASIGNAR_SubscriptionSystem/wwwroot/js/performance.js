/**
 * Performance Optimization Module
 * Lazy loading, image optimization, and resource management
 *
 * Improvements addressed:
 * - #5: Lazy loading for images and resources
 * - #5: Code splitting and async loading
 * - #5: Performance monitoring
 */

;(function () {
  'use strict'

  /**
   * Initialize performance optimizations
   */
  function initPerformanceOptimizations() {
    // Lazy load images
    initLazyLoading()

    // Preload critical resources
    preloadCriticalResources()

    // Monitor performance
    monitorPerformance()

    // Optimize scroll performance
    optimizeScrollPerformance()
  }

  /**
   * Lazy loading for images
   */
  function initLazyLoading() {
    // Check for native lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
      // Use native lazy loading
      const images = document.querySelectorAll('img[data-src]')
      images.forEach((img) => {
        img.src = img.dataset.src
        img.loading = 'lazy'
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset
        }
      })
    } else {
      // Fallback: Intersection Observer
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target
              img.src = img.dataset.src
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset
              }
              img.classList.add('loaded')
              observer.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      )

      const images = document.querySelectorAll('img[data-src]')
      images.forEach((img) => imageObserver.observe(img))
    }
  }

  /**
   * Preload critical resources
   */
  function preloadCriticalResources() {
    // Preload fonts
    const fonts = [
      '/fonts/inter-var.woff2', // Adjust path as needed
    ]

    fonts.forEach((font) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.href = font
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })

    // Preconnect to external resources
    const preconnects = [
      'https://cdn.jsdelivr.net',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ]

    preconnects.forEach((url) => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = url
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }

  /**
   * Monitor and log performance metrics
   */
  function monitorPerformance() {
    if ('PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.warn('LCP monitoring not supported')
      }

      // Monitor First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime)
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        console.warn('FID monitoring not supported')
      }
    }

    // Log navigation timing when page loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        const connectTime = perfData.responseEnd - perfData.requestStart
        const renderTime = perfData.domComplete - perfData.domLoading

        console.group('Performance Metrics')
        console.log('Page Load Time:', pageLoadTime + 'ms')
        console.log('Connect Time:', connectTime + 'ms')
        console.log('Render Time:', renderTime + 'ms')
        console.groupEnd()
      }, 0)
    })
  }

  /**
   * Optimize scroll performance with debouncing
   */
  function optimizeScrollPerformance() {
    let ticking = false

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    })
  }

  /**
   * Handle scroll events efficiently
   */
  function handleScroll() {
    // Navbar shadow on scroll
    const navbar = document.querySelector('.navbar')
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled')
      } else {
        navbar.classList.remove('scrolled')
      }
    }

    // Fade in elements on scroll
    const fadeElements = document.querySelectorAll(
      '.fade-in-on-scroll:not(.visible)'
    )
    fadeElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight * 0.85
      if (isVisible) {
        element.classList.add('visible')
      }
    })
  }

  /**
   * Defer non-critical JavaScript
   */
  function deferNonCriticalJS() {
    const deferredScripts = document.querySelectorAll('script[data-defer]')

    deferredScripts.forEach((script) => {
      const newScript = document.createElement('script')
      newScript.src = script.dataset.src
      newScript.defer = true
      document.body.appendChild(newScript)
    })
  }

  /**
   * Optimize third-party scripts
   */
  function optimizeThirdPartyScripts() {
    // Load analytics after page interaction
    let analyticsLoaded = false

    const loadAnalytics = () => {
      if (!analyticsLoaded) {
        analyticsLoaded = true
        // Load analytics script here if needed
        console.log('Analytics loaded on interaction')
      }
    }

    // Load on first interaction
    ;['scroll', 'click', 'touchstart'].forEach((event) => {
      window.addEventListener(event, loadAnalytics, { once: true })
    })

    // Or after 3 seconds of idle
    setTimeout(loadAnalytics, 3000)
  }

  /**
   * Image optimization - add blur-up effect
   */
  function addBlurUpEffect() {
    const images = document.querySelectorAll('img[data-blur-up]')

    images.forEach((img) => {
      // Create low-res placeholder
      const placeholder = new Image()
      placeholder.src = img.dataset.blurUp
      placeholder.style.filter = 'blur(10px)'
      placeholder.style.transform = 'scale(1.1)'

      img.parentElement.style.position = 'relative'
      placeholder.style.position = 'absolute'
      placeholder.style.inset = '0'

      img.parentElement.insertBefore(placeholder, img)

      // Load full image
      img.addEventListener('load', () => {
        img.style.opacity = '1'
        setTimeout(() => placeholder.remove(), 300)
      })
    })
  }

  /**
   * Resource hints for better performance
   */
  function addResourceHints() {
    // DNS prefetch for external domains
    const dnsPrefetch = ['https://cdn.jsdelivr.net']

    dnsPrefetch.forEach((domain) => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = domain
      document.head.appendChild(link)
    })
  }

  /**
   * Detect slow connection and adjust
   */
  function detectConnectionSpeed() {
    if ('connection' in navigator) {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection

      if (connection) {
        const effectiveType = connection.effectiveType

        // Disable animations on slow connections
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          document.body.classList.add('slow-connection')
          console.log('Slow connection detected - animations reduced')
        }
      }
    }
  }

  /**
   * Clean up memory on page unload
   */
  function setupCleanup() {
    window.addEventListener('beforeunload', () => {
      // Clear any intervals
      // Remove event listeners
      // Clean up references
    })
  }

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPerformanceOptimizations()
      detectConnectionSpeed()
      optimizeThirdPartyScripts()
      setupCleanup()
    })
  } else {
    initPerformanceOptimizations()
    detectConnectionSpeed()
    optimizeThirdPartyScripts()
    setupCleanup()
  }

  // Export for external use
  window.PerformanceOptimizer = {
    initLazyLoading,
    monitorPerformance,
    detectConnectionSpeed,
  }
})()
