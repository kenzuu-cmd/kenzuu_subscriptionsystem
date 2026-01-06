/**
 * Landing Page JavaScript - Award-Winning SaaS Homepage
 * Handles: Scroll animations, counters, pricing toggle, and micro-interactions
 * 
 * @version 2.2.0
 * @author SubWise Team
 */

(function() {
    'use strict';

    /* ========================================
       CONFIGURATION
       ======================================== */
    const CONFIG = {
        intersectionThreshold: 0.15,
        counterDuration: 2000,
        pricingMonthly: { pro: 4.99 },
        pricingAnnual: { pro: 47.99 }
    };

    /* ========================================
       STATE MANAGEMENT
       ======================================== */
    let hasCounterAnimated = false;
    let isPricingAnnual = false;

    /* ========================================
       INITIALIZATION
       ======================================== */
    
    /**
     * Initialize all landing page features
     * Called when DOM is ready
     */
    function initLanding() {
        console.log('🚀 Initializing landing page...');
        
        // Setup all features
        setupSmoothScroll();
        setupScrollAnimations();
        setupFeatureCardAnimations();
        setupPricingToggle();
        setupHeroAnimations();
        trackPageView();
        
        console.log('✓ Landing page initialized successfully');
    }

    /* ========================================
       HERO ANIMATIONS
       ======================================== */
    
    /**
     * Setup hero section animations
     * Note: Hero card removed and replaced with shape blur effect
     */
    function setupHeroAnimations() {
        // Hero savings counter removed - now using animated shape blur
        // Animation handled purely by CSS
    }

    /* ========================================
       SCROLL-TRIGGERED ANIMATIONS
       ======================================== */
    
    /**
     * Setup intersection observer for scroll animations
     * Animates sections as they enter the viewport
     */
    function setupScrollAnimations() {
        const observerOptions = {
            threshold: CONFIG.intersectionThreshold,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // Trigger counters when features section is visible
                    if (entry.target.classList.contains('features-section') && !hasCounterAnimated) {
                        animateAllCounters();
                        hasCounterAnimated = true;
                    }
                }
            });
        }, observerOptions);

        // Observe all sections with fade-in-section class
        document.querySelectorAll('.fade-in-section').forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Setup feature card entrance animations
     * Cards animate in as they become visible
     */
    function setupFeatureCardAnimations() {
        const featureCards = document.querySelectorAll('.feature-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        featureCards.forEach(card => {
            observer.observe(card);
        });
    }

    /* ========================================
       ANIMATED COUNTERS
       ======================================== */
    
    /**
     * Animate all counter elements
     * Triggered when stats section becomes visible
     */
    function animateAllCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            animateCounter(counter, 0, target, CONFIG.counterDuration);
        });
    }

    /**
     * Animate a single counter from start to end
     * Uses easing function for smooth animation
     * 
     * @param {HTMLElement} element - The counter element to animate
     * @param {number} start - Starting value
     * @param {number} end - Ending value
     * @param {number} duration - Animation duration in milliseconds
     */
    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const isDecimal = end % 1 !== 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-cubic) for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOut;
            
            // Format number based on type
            if (isDecimal) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = isDecimal ? end.toFixed(1) : end;
            }
        }
        
        requestAnimationFrame(update);
    }

    /* ========================================
       PRICING TOGGLE
       ======================================== */
    
    /**
     * Setup pricing toggle functionality
     * Allows switching between monthly and annual pricing
     */
    function setupPricingToggle() {
        const toggle = document.getElementById('pricing-toggle');
        if (!toggle) return;

        // Click handler
        toggle.addEventListener('click', togglePricing);
        
        // Keyboard support for accessibility
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePricing();
            }
        });
    }

    /**
     * Toggle between monthly and annual pricing
     * Animates the price change with fade effect
     */
    function togglePricing() {
        const toggle = document.getElementById('pricing-toggle');
        const proPriceMonthly = document.getElementById('pro-price-monthly');
        const proPriceAnnual = document.getElementById('pro-price-annual');
        
        if (!toggle || !proPriceMonthly || !proPriceAnnual) return;

        isPricingAnnual = !isPricingAnnual;
        
        // Update toggle state
        toggle.classList.toggle('active', isPricingAnnual);
        toggle.setAttribute('aria-checked', isPricingAnnual);
        
        // Animate price change with fade effect
        if (isPricingAnnual) {
            // Show annual pricing
            fadeOut(proPriceMonthly.parentElement, () => {
                proPriceMonthly.parentElement.classList.add('d-none');
                proPriceAnnual.parentElement.classList.remove('d-none');
                fadeIn(proPriceAnnual.parentElement);
            });
        } else {
            // Show monthly pricing
            fadeOut(proPriceAnnual.parentElement, () => {
                proPriceAnnual.parentElement.classList.add('d-none');
                proPriceMonthly.parentElement.classList.remove('d-none');
                fadeIn(proPriceMonthly.parentElement);
            });
        }
    }

    /**
     * Fade out element with callback
     * @param {HTMLElement} element - Element to fade out
     * @param {Function} callback - Function to call after fade completes
     */
    function fadeOut(element, callback) {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';
        setTimeout(() => {
            if (callback) callback();
        }, 300);
    }

    /**
     * Fade in element
     * @param {HTMLElement} element - Element to fade in
     */
    function fadeIn(element) {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transition = 'opacity 0.3s ease';
            element.style.opacity = '1';
        }, 50);
    }

    /* ========================================
       SMOOTH SCROLL
       ======================================== */
    
    /**
     * Set up smooth scroll for anchor links
     * Handles navigation within the same page
     */
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                // Ignore generic hash links
                if (href === '#') {
                    e.preventDefault();
                    return;
                }
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const navHeight = 80; // Height of fixed navbar
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* ========================================
       ANALYTICS & TRACKING
       ======================================== */
    
    /**
     * Track page view for analytics
     * Logs basic page view data
     */
    function trackPageView() {
        const pageData = {
            page: 'landing',
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };
        
        console.log('📊 Page view tracked:', pageData);
    }

    /* ========================================
       MODULE INITIALIZATION
       ======================================== */
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanding);
    } else {
        initLanding();
    }

    // Export public API for debugging and testing
    window.LandingPage = {
        togglePricing,
        animateCounter,
        trackPageView,
        version: '2.2.0'
    };

    console.log('✓ Landing Page Module loaded (v2.2.0)');

})();
        
        // Animate price change
        if (isPricingAnnual) {
            // Show annual
            fadeOut(proPriceMonthly.parentElement, () => {
                proPriceMonthly.parentElement.classList.add('d-none');
                proPriceAnnual.parentElement.classList.remove('d-none');
                fadeIn(proPriceAnnual.parentElement);
            });
        } else {
            // Show monthly
            fadeOut(proPriceAnnual.parentElement, () => {
                proPriceAnnual.parentElement.classList.add('d-none');
                proPriceMonthly.parentElement.classList.remove('d-none');
                fadeIn(proPriceMonthly.parentElement);
            });
        }
    }

    /**
     * Fade out element
     */
    function fadeOut(element, callback) {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';
        setTimeout(() => {
            if (callback) callback();
        }, 300);
    }

    /**
     * Fade in element
     */
    function fadeIn(element) {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transition = 'opacity 0.3s ease';
            element.style.opacity = '1';
        }, 50);
    }

    /* ========================================
       CTA HANDLERS
       ======================================== */
    
    /**
     * Set up CTA button handlers
     */
    function setupCTAHandlers() {
        const ctaButtons = [
            'pricing-free-btn',
            'pricing-pro-btn',
            'final-cta-btn'
        ];

        ctaButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const plan = id.includes('pro') ? 'pro' : 'free';
                    showSignUpModal(plan);
                });
            }
        });
    }

    /* ========================================
       SMOOTH SCROLL
       ======================================== */
    
    /**
     * Set up smooth scroll for anchor links
     */
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#demo-video') {
                    e.preventDefault();
                    if (href === '#demo-video') {
                        showDemoModal();
                    }
                    return;
                }
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const navHeight = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* ========================================
       SIGN-UP MODAL
       ======================================== */
    
    /**
     * Show sign-up modal
     */
    function showSignUpModal(plan = 'free') {
        const modal = document.getElementById('signupModal');
        if (!modal) return;

        sessionStorage.setItem('selectedPlan', plan);

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('shown.bs.modal', () => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, { once: true });
    }

    /**
     * Set up sign-up modal form
     */
    function setupSignUpModal() {
        const form = document.getElementById('signup-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignUpSubmit(form);
        });
    }

    /**
     * Handle sign-up form submission
     */
    function handleSignUpSubmit(form) {
        const name = document.getElementById('signup-name')?.value;
        const email = document.getElementById('signup-email')?.value;
        const password = document.getElementById('signup-password')?.value;
        const plan = sessionStorage.getItem('selectedPlan') || 'free';

        if (!name || !email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating account...';

        setTimeout(() => {
            const mockUser = {
                id: 'user-' + Date.now(),
                name: name,
                email: email,
                plan: plan,
                createdAt: new Date().toISOString()
            };

            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            localStorage.setItem('isAuthenticated', 'true');

            showNotification('Welcome aboard! Redirecting to your dashboard...', 'success');

            const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
            if (modal) modal.hide();

            setTimeout(() => {
                window.location.href = '/Index';
            }, 1500);

        }, 1500);
    }

    /* ========================================
       DEMO VIDEO MODAL
       ======================================== */
    
    /**
     * Show demo video modal
     */
    function showDemoModal() {
        showNotification('?? Demo video coming soon! Check back later.', 'info');
    }

    /* ========================================
       UTILITIES
       ======================================== */
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        if (window.SubscriptionUI && window.SubscriptionUI.showNotification) {
            window.SubscriptionUI.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Track page view
     */
    function trackPageView() {
        const pageData = {
            page: 'landing',
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };
        
        console.log('?? Page view tracked:', pageData);
    }

    /**
     * Setup counter animations
     */
    function setupCounters() {
        // Counters are triggered by scroll animations
        // This function is a placeholder for future enhancements
    }

    /* ========================================
       INITIALIZATION
       ======================================== */
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanding);
    } else {
        initLanding();
    }

    // Export public API for debugging
    window.LandingPage = {
        showSignUpModal,
        togglePricing,
        animateCounter,
        trackPageView,
        version: '2.1.0'
    };

    console.log('?? Landing Page Module loaded');

})();
