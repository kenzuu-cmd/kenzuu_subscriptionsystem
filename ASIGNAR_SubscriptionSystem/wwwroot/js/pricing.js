/**
 * Pricing Section Interactions
 * Handles billing toggle, price animations, and accessibility
 * @version 1.0.0
 */

(function () {
  'use strict';

  // State management
  let isYearly = false;

  /**
   * Toggle between monthly and yearly billing
   */
  window.toggleBilling = function () {
    isYearly = !isYearly;

    // Update toggle UI
    const toggleBtn = document.getElementById('billing-toggle-btn');
    const toggleSwitch = document.querySelector('.billing-switch');
    const monthlyLabel = document.getElementById('monthly-label');
    const yearlyLabel = document.getElementById('yearly-label');

    if (toggleBtn && toggleSwitch) {
      toggleSwitch.classList.toggle('active', isYearly);
      toggleBtn.setAttribute('aria-checked', isYearly.toString());

      if (isYearly) {
        toggleBtn.querySelector('.sr-only').textContent =
          'Switch to monthly billing';
      } else {
        toggleBtn.querySelector('.sr-only').textContent =
          'Switch to yearly billing';
      }
    }

    // Update label states
    if (monthlyLabel && yearlyLabel) {
      monthlyLabel.classList.toggle('active', !isYearly);
      yearlyLabel.classList.toggle('active', isYearly);
    }

    // Update prices with animation
    updatePrices();

    // Update billing notes
    updateBillingNotes();

    // Track analytics (if available)
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('Pricing Toggle Changed', {
        billingPeriod: isYearly ? 'yearly' : 'monthly',
      });
    }
  };

  /**
   * Update pricing values with smooth animation
   */
  function updatePrices() {
    const priceElements = document.querySelectorAll('.pricing-value');

    priceElements.forEach((element) => {
      const monthlyPrice = parseInt(element.getAttribute('data-monthly'), 10);
      const yearlyPrice = parseInt(element.getAttribute('data-yearly'), 10);
      const targetPrice = isYearly ? yearlyPrice : monthlyPrice;
      const currentPrice = parseInt(element.textContent, 10);

      // Animate price change
      animateValue(element, currentPrice, targetPrice, 400);
    });
  }

  /**
   * Animate number transition
   * @param {HTMLElement} element - Element to animate
   * @param {number} start - Starting value
   * @param {number} end - Ending value
   * @param {number} duration - Animation duration in ms
   */
  function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // ~60fps
    let current = start;
    const isIncreasing = end > start;

    const timer = setInterval(() => {
      current += increment;

      if (
        (isIncreasing && current >= end) ||
        (!isIncreasing && current <= end)
      ) {
        element.textContent = end;
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, 16);
  }

  /**
   * Update billing note visibility
   */
  function updateBillingNotes() {
    const monthlyNotes = document.querySelectorAll('.billing-note-monthly');
    const yearlyNotes = document.querySelectorAll('.billing-note-yearly');

    monthlyNotes.forEach((note) => {
      note.style.display = isYearly ? 'none' : 'block';
    });

    yearlyNotes.forEach((note) => {
      note.style.display = isYearly ? 'block' : 'none';
    });
  }

  /**
   * Handle keyboard navigation for pricing toggle
   */
  function initKeyboardNavigation() {
    const toggleBtn = document.getElementById('billing-toggle-btn');

    if (toggleBtn) {
      toggleBtn.addEventListener('keydown', (e) => {
        // Space or Enter key
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleBilling();
        }
      });
    }
  }

  /**
   * Track pricing card interactions
   */
  function initPricingAnalytics() {
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach((card) => {
      const planName = card.querySelector('.pricing-plan-name')?.textContent;
      const ctaButton = card.querySelector('.btn-pricing');

      if (ctaButton && planName) {
        ctaButton.addEventListener('click', () => {
          if (
            window.analytics &&
            typeof window.analytics.track === 'function'
          ) {
            window.analytics.track('Pricing CTA Clicked', {
              plan: planName,
              billingPeriod: isYearly ? 'yearly' : 'monthly',
            });
          }
        });
      }

      // Track card focus for engagement
      card.addEventListener('focus', () => {
        if (
          window.analytics &&
          typeof window.analytics.track === 'function'
        ) {
          window.analytics.track('Pricing Card Viewed', {
            plan: planName,
          });
        }
      });
    });
  }

  /**
   * Add hover effects with parallax
   */
  function initParallaxEffects() {
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Subtle tilt
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
      });

      card.addEventListener('mouseleave', () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        card.style.transform = '';
      });
    });
  }

  /**
   * Scroll-triggered animations
   */
  function initScrollAnimations() {
    const pricingSection = document.querySelector('.pricing-section');

    if (!pricingSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            pricingSection.classList.add('visible');

            // Track analytics
            if (
              window.analytics &&
              typeof window.analytics.track === 'function'
            ) {
              window.analytics.track('Pricing Section Viewed');
            }
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% visible
      }
    );

    observer.observe(pricingSection);
  }

  /**
   * Add smooth scroll to pricing section
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href="#pricing"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pricingSection = document.querySelector('#pricing');

        if (pricingSection) {
          pricingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });

          // Update URL without jumping
          if (window.history && window.history.pushState) {
            window.history.pushState(null, null, '#pricing');
          }
        }
      });
    });
  }

  /**
   * Handle URL hash on page load
   */
  function handleHashOnLoad() {
    if (window.location.hash === '#pricing') {
      setTimeout(() => {
        const pricingSection = document.querySelector('#pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }

  /**
   * Initialize tooltip system for feature descriptions
   */
  function initTooltips() {
    const featureItems = document.querySelectorAll('.pricing-features li');

    featureItems.forEach((item) => {
      item.setAttribute('role', 'listitem');

      // Add aria-label for screen readers
      const text = item.querySelector('span')?.textContent;
      if (text) {
        item.setAttribute('aria-label', text);
      }
    });
  }

  /**
   * Initialize all pricing interactions
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize features
    initKeyboardNavigation();
    initPricingAnalytics();
    initScrollAnimations();
    initSmoothScroll();
    initTooltips();
    handleHashOnLoad();

    // Only add parallax on devices that support hover
    if (window.matchMedia('(hover: hover)').matches) {
      initParallaxEffects();
    }

    console.log('✓ Pricing interactions initialized');
  }

  // Auto-initialize
  init();
})();
