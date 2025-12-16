/**
* Mock Data Manager
* Client-side data management with localStorage persistence
*/

(function(window) {
    'use strict';

    // Initial mock subscriptions data
    const INITIAL_MOCK_DATA = [
        {
            id: 'sub-001',
            serviceName: 'Netflix',
            category: 'Entertainment',
            price: 15.99,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-10',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'Premium',
            notes: 'Family plan with 4K streaming'
        },
        {
            id: 'sub-002',
            serviceName: 'Spotify',
            category: 'Entertainment',
            price: 10.99,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-05',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'Premium Individual',
            notes: 'Ad-free music streaming'
        },
        {
            id: 'sub-003',
            serviceName: 'Adobe Creative Cloud',
            category: 'Work Tools',
            price: 54.99,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-15',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'All Apps',
            notes: 'Photoshop, Illustrator, Premiere Pro'
        },
        {
            id: 'sub-004',
            serviceName: 'GitHub Pro',
            category: 'Work Tools',
            price: 4.00,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-01',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'Pro',
            notes: 'Private repositories and advanced tools'
        },
        {
            id: 'sub-005',
            serviceName: 'AWS',
            category: 'Utilities',
            price: 89.00,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-08',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'Pay As You Go',
            notes: 'Cloud hosting and services'
        },
        {
            id: 'sub-006',
            serviceName: 'Notion',
            category: 'Work Tools',
            price: 8.00,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-12',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'Personal Pro',
            notes: 'Note-taking and project management'
        },
        {
            id: 'sub-007',
            serviceName: 'Disney+',
            category: 'Entertainment',
            price: 7.99,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-20',
            status: 'paused',
            trialEndsDate: null,
            autoRenew: false,
            planTier: 'Standard',
            notes: 'Paused until March'
        },
        {
            id: 'sub-008',
            serviceName: 'ChatGPT Plus',
            category: 'Work Tools',
            price: 20.00,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-25',
            status: 'trial',
            trialEndsDate: '2025-02-25',
            autoRenew: true,
            planTier: 'Plus',
            notes: 'Free trial ends Feb 25'
        },
        {
            id: 'sub-009',
            serviceName: 'Hulu',
            category: 'Entertainment',
            price: 14.99,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-01-28',
            status: 'expired',
            trialEndsDate: null,
            autoRenew: false,
            planTier: 'No Ads',
            notes: 'Expired - needs renewal'
        },
        {
            id: 'sub-010',
            serviceName: 'Google Workspace',
            category: 'Utilities',
            price: 12.00,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-18',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'Business Starter',
            notes: 'Email and cloud storage'
        },
        {
            id: 'sub-011',
            serviceName: 'Figma',
            category: 'Work Tools',
            price: 15.00,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-22',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'Professional',
            notes: 'Design and prototyping tool'
        },
        {
            id: 'sub-012',
            serviceName: 'Dropbox',
            category: 'Utilities',
            price: 11.99,
            billingCycle: 'Monthly',
            nextPaymentDate: '2025-02-14',
            status: 'active',
            trialEndsDate: null,
            autoRenew: true,
            planTier: 'Plus',
            notes: '2TB cloud storage'
        }
    ];

    // Storage key for localStorage
    const STORAGE_KEY = 'subscriptionSystem_data';

    /**
     * Subscription Manager
     * Handles CRUD operations and persistence
     */
    const SubscriptionManager = {
        
        /**
         * Load subscriptions from localStorage or return initial data
         */
        load: function() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored);
                    // Validate data structure
                    if (Array.isArray(data) && data.length > 0) {
                        return data;
                    }
                }
            } catch (e) {
                console.warn('Failed to load subscriptions from localStorage:', e);
            }
            // Return initial data if nothing in localStorage
            return INITIAL_MOCK_DATA;
        },

        /**
         * Save subscriptions to localStorage
         */
        save: function(subscriptions) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
                return true;
            } catch (e) {
                console.error('Failed to save subscriptions to localStorage:', e);
                return false;
            }
        },

        /**
         * Reset to initial mock data
         */
        resetToMocks: function() {
            const saved = this.save(INITIAL_MOCK_DATA);
            if (saved) {
                console.log('? Subscriptions reset to initial mock data');
                // Dispatch custom event for UI refresh
                window.dispatchEvent(new CustomEvent('subscriptionsReset'));
            }
            return INITIAL_MOCK_DATA;
        },

        /**
         * Get all subscriptions
         */
        getAll: function() {
            return this.load();
        },

        /**
         * Get subscription by ID
         */
        getById: function(id) {
            const subscriptions = this.load();
            return subscriptions.find(sub => sub.id === id);
        },

        /**
         * Add new subscription
         */
        add: function(subscription) {
            const subscriptions = this.load();
            // Generate unique ID
            const newId = 'sub-' + Date.now();
            const newSubscription = {
                id: newId,
                status: 'active',
                autoRenew: true,
                trialEndsDate: null,
                notes: '',
                ...subscription
            };
            subscriptions.push(newSubscription);
            this.save(subscriptions);
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('subscriptionAdded', { 
                detail: newSubscription 
            }));
            
            return newSubscription;
        },

        /**
         * Update existing subscription
         */
        update: function(id, updates) {
            const subscriptions = this.load();
            const index = subscriptions.findIndex(sub => sub.id === id);
            
            if (index !== -1) {
                subscriptions[index] = {
                    ...subscriptions[index],
                    ...updates
                };
                this.save(subscriptions);
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
                    detail: subscriptions[index] 
                }));
                
                return subscriptions[index];
            }
            return null;
        },

        /**
         * Delete subscription
         */
        delete: function(id) {
            const subscriptions = this.load();
            const filtered = subscriptions.filter(sub => sub.id !== id);
            
            if (filtered.length !== subscriptions.length) {
                this.save(filtered);
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('subscriptionDeleted', { 
                    detail: { id } 
                }));
                
                return true;
            }
            return false;
        },

        /**
         * Filter subscriptions
         */
        filter: function(criteria) {
            const subscriptions = this.load();
            return subscriptions.filter(sub => {
                // Search by name
                if (criteria.search) {
                    const search = criteria.search.toLowerCase();
                    if (!sub.serviceName.toLowerCase().includes(search) &&
                        !sub.category.toLowerCase().includes(search)) {
                        return false;
                    }
                }
                
                // Filter by status
                if (criteria.status && criteria.status !== 'all') {
                    if (sub.status !== criteria.status) return false;
                }
                
                // Filter by category
                if (criteria.category && criteria.category !== 'all') {
                    if (sub.category !== criteria.category) return false;
                }
                
                // Filter by billing cycle
                if (criteria.billingCycle && criteria.billingCycle !== 'all') {
                    if (sub.billingCycle !== criteria.billingCycle) return false;
                }
                
                return true;
            });
        },

        /**
         * Sort subscriptions
         */
        sort: function(subscriptions, sortBy, sortOrder = 'asc') {
            const sorted = [...subscriptions].sort((a, b) => {
                let comparison = 0;
                
                switch(sortBy) {
                    case 'name':
                        comparison = a.serviceName.localeCompare(b.serviceName);
                        break;
                    case 'price':
                        comparison = a.price - b.price;
                        break;
                    case 'date':
                        comparison = new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate);
                        break;
                    case 'category':
                        comparison = a.category.localeCompare(b.category);
                        break;
                    default:
                        comparison = 0;
                }
                
                return sortOrder === 'asc' ? comparison : -comparison;
            });
            
            return sorted;
        },

        /**
         * Get statistics
         */
        getStats: function() {
            const subscriptions = this.load();
            const active = subscriptions.filter(s => s.status === 'active');
            const monthlyTotal = active.reduce((sum, sub) => {
                const monthly = sub.billingCycle === 'Monthly' ? sub.price : sub.price / 12;
                return sum + monthly;
            }, 0);
            
            return {
                total: subscriptions.length,
                active: active.length,
                paused: subscriptions.filter(s => s.status === 'paused').length,
                expired: subscriptions.filter(s => s.status === 'expired').length,
                trial: subscriptions.filter(s => s.status === 'trial').length,
                monthlyTotal: monthlyTotal.toFixed(2),
                yearlyTotal: (monthlyTotal * 12).toFixed(2)
            };
        },

        /**
         * Get categories
         */
        getCategories: function() {
            const subscriptions = this.load();
            const categories = [...new Set(subscriptions.map(s => s.category))];
            return categories.sort();
        }
    };

    // Export to window
    window.SubscriptionManager = SubscriptionManager;

})(window);
