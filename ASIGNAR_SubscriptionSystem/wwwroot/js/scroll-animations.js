/**
 * Scroll Animation Controller
 * Unified fade-in animations using Intersection Observer
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * Initialize scroll-triggered fade-in animations
     */
    function initScrollAnimations() {
        // Get all elements with fade-in-on-scroll class
        const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
        
        if (fadeElements.length === 0) {
            return;
        }

        // Reset all elements on load
        fadeElements.forEach(el => {
            el.classList.remove('visible');
        });

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Skip animations, make everything visible immediately
            fadeElements.forEach(el => {
                el.classList.add('visible');
            });
            return;
        }

        // Create intersection observer
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add visible class when element enters viewport
                    entry.target.classList.add('visible');
                    
                    // Optional: Stop observing after animation (uncomment for "once" behavior)
                    // scrollObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        fadeElements.forEach(el => {
            scrollObserver.observe(el);
        });

        // Store observer globally for cleanup if needed
        window.scrollAnimationObserver = scrollObserver;
    }

    /**
     * Refresh animations for dynamically added content
     */
    window.refreshScrollAnimations = function() {
        if (window.scrollAnimationObserver) {
            const newElements = document.querySelectorAll('.fade-in-on-scroll:not(.visible)');
            newElements.forEach(el => {
                window.scrollAnimationObserver.observe(el);
            });
        }
    };

    /**
     * Initialize on DOM ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }

})();
