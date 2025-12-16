/**
 * Theme Switcher
 * Dark/Light mode toggle with smooth transitions
 */

(function(window) {
    'use strict';

    const THEME_KEY = 'subscriptionSystem_theme';
    
    const ThemeSwitcher = {
        currentTheme: 'dark',
        
        /**
         * Initialize theme switcher
         */
        init: function() {
            console.log('?? Initializing Theme Switcher...');
            this.loadTheme();
            this.attachEventListeners();
            console.log('? Theme Switcher initialized with theme:', this.currentTheme);
        },
        
        /**
         * Load saved theme or detect system preference
         */
        loadTheme: function() {
            const saved = localStorage.getItem(THEME_KEY);
            
            if (saved) {
                this.currentTheme = saved;
                console.log('?? Loaded saved theme:', saved);
            } else {
                // Detect system preference
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                    this.currentTheme = 'light';
                    console.log('?? Detected system preference: light');
                } else {
                    console.log('?? Using default theme: dark');
                }
            }
            
            this.applyTheme(this.currentTheme, false);
        },
        
        /**
         * Attach event listeners
         */
        attachEventListeners: function() {
            // Use event delegation for dynamically created buttons
            document.addEventListener('click', (e) => {
                const toggleBtn = e.target.closest('#theme-toggle');
                if (toggleBtn) {
                    e.preventDefault();
                    this.toggle();
                }
            });
            
            // Listen for system theme changes
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    if (!localStorage.getItem(THEME_KEY)) {
                        console.log('?? System theme changed:', e.matches ? 'dark' : 'light');
                        this.applyTheme(e.matches ? 'dark' : 'light', true);
                    }
                });
            }
        },
        
        /**
         * Toggle theme
         */
        toggle: function() {
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            console.log('?? Toggling theme:', this.currentTheme, '?', newTheme);
            this.applyTheme(newTheme, true);
            localStorage.setItem(THEME_KEY, newTheme);
        },
        
        /**
         * Apply theme
         */
        applyTheme: function(theme, animate = true) {
            this.currentTheme = theme;
            
            // Add transition class
            if (animate) {
                document.documentElement.classList.add('theme-transitioning');
            }
            
            // Apply theme
            document.documentElement.setAttribute('data-theme', theme);
            console.log('? Theme applied:', theme);
            
            // Update all toggle button icons
            const icons = document.querySelectorAll('#theme-toggle i');
            icons.forEach(icon => {
                icon.className = `bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`;
            });
            
            // Update button titles
            const buttons = document.querySelectorAll('#theme-toggle');
            buttons.forEach(btn => {
                btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
                btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            });
            
            // Remove transition class after animation
            if (animate) {
                setTimeout(() => {
                    document.documentElement.classList.remove('theme-transitioning');
                }, 350);
            }
        },
        
        /**
         * Get current theme
         */
        getTheme: function() {
            return this.currentTheme;
        }
    };
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ThemeSwitcher.init();
        });
    } else {
        ThemeSwitcher.init();
    }
    
    // Export to window
    window.ThemeSwitcher = ThemeSwitcher;
    
})(window);
