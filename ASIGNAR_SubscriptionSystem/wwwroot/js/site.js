/**
* Site JavaScript
* Main application initialization
*/

(function() {
    'use strict';

    /**
     * Initialize application
     */
    function initApp() {
        // Initialize UI components
        if (window.SubscriptionUI) {
            window.SubscriptionUI.init();
        }

        // Set up global event listeners
        setupGlobalListeners();

        // Initialize page-specific components
        initializePageComponents();
    }

    /**
     * Set up global event listeners
     */
    function setupGlobalListeners() {
        // Listen for subscription changes
        window.addEventListener('subscriptionAdded', (e) => {
            if (window.SubscriptionUI) {
                window.SubscriptionUI.showNotification(`${e.detail.serviceName} added successfully`, 'success');
            }
        });

        window.addEventListener('subscriptionUpdated', (e) => {
            // Handle subscription updates
        });

        window.addEventListener('subscriptionDeleted', (e) => {
            // Handle subscription deletions
        });

        window.addEventListener('subscriptionsReset', () => {
            if (window.SubscriptionUI) {
                window.SubscriptionUI.showNotification('Data reset to defaults', 'info');
            }
        });
    }

    /**
     * Initialize page-specific components
     */
    function initializePageComponents() {
        // Check which page we're on and initialize accordingly
        const currentPath = window.location.pathname.toLowerCase();

        if (currentPath.includes('index') || currentPath === '/') {
            initializeDashboard();
        }
    }

    /**
     * Initialize dashboard page
     */
    function initializeDashboard() {
        const searchInput = document.getElementById('subscription-search');
        const filterButtons = document.querySelectorAll('[data-filter]');
        const sortButtons = document.querySelectorAll('[data-sort]');

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    filterSubscriptions();
                }, 300);
            });
        }

        if (filterButtons.length > 0) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Remove active class from siblings
                    btn.parentElement.querySelectorAll('[data-filter]').forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    filterSubscriptions();
                });
            });
        }

        if (sortButtons.length > 0) {
            sortButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sortBy = btn.dataset.sort;
                    sortSubscriptions(sortBy);
                });
            });
        }

        // Set up subscription row click handlers
        setupSubscriptionRowHandlers();
    }

    /**
     * Filter subscriptions
     */
    function filterSubscriptions() {
        const searchTerm = document.getElementById('subscription-search')?.value || '';
        const activeFilter = document.querySelector('[data-filter].active')?.dataset.filter || 'all';
        
        if (window.SubscriptionManager) {
            window.SubscriptionManager.filter({
                search: searchTerm,
                status: activeFilter
            });
        }
    }

    /**
     * Sort subscriptions
     */
    function sortSubscriptions(sortBy) {
        if (window.SubscriptionManager) {
            const filtered = window.SubscriptionManager.filter({
                search: document.getElementById('subscription-search')?.value || '',
                status: document.querySelector('[data-filter].active')?.dataset.filter || 'all'
            });
            const sorted = window.SubscriptionManager.sort(filtered, sortBy, 'asc');
        }
    }

    /**
     * Set up click handlers for subscription rows
     */
    function setupSubscriptionRowHandlers() {
        // Handle three-dots menu clicks
        document.querySelectorAll('[data-subscription-id]').forEach(row => {
            const actionButton = row.querySelector('.subscription-actions');
            if (actionButton) {
                actionButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const subscriptionId = row.dataset.subscriptionId;
                    if (window.SubscriptionUI && subscriptionId) {
                        window.SubscriptionUI.showSubscriptionDetail(subscriptionId);
                    }
                });
            }
        });
    }

    /**
     * Utility: Format currency
     */
    window.formatCurrency = function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    /**
     * Utility: Format date
     */
    window.formatDate = function(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    /**
     * Utility: Calculate days until date
     */
    window.daysUntil = function(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    /**
     * Layout helper utilities
     */
    window.appLayoutHelpers = {
        /**
         * Ensure footer is positioned correctly
         */
        ensureFooterPosition: function() {
            const body = document.body;
            const footer = document.querySelector('footer');
            
            if (!footer) return;
            
            // Verify flexbox layout is applied
                const bodyStyles = window.getComputedStyle(body);
            if (bodyStyles.display !== 'flex') {
                body.classList.add('d-flex', 'flex-column', 'min-vh-100');
            }
            
            // Verify main has flex-grow
            const main = document.querySelector('main');
            if (main) {
                const mainStyles = window.getComputedStyle(main);
                if (mainStyles.flexGrow === '0') {
                    main.classList.add('flex-grow-1');
                }
            }
        },
        
        /**
         * Enable or disable layout debug mode
         */
        debugLayout: function(enable = true) {
            if (enable) {
                document.body.classList.add('layout-debug');
            } else {
                document.body.classList.remove('layout-debug');
            }
        },
        
        /**
         * Recalculate layout on window resize
         */
        recalcOnResize: function() {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.ensureFooterPosition();
                }, 250);
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();


