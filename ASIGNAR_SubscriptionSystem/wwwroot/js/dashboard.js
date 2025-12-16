/**
* Dashboard JavaScript
* Index page specific scripts
*/

(function() {
    'use strict';

    let allSubscriptions = [];
    let filteredSubscriptions = [];
    let currentFilter = 'all';
    let currentSort = 'date';
    let currentSortOrder = 'asc';
    let currentSearch = '';

    /**
     * Initialize dashboard
     */
    function initDashboard() {

        // Load mock data
        if (window.SubscriptionManager) {
            allSubscriptions = window.SubscriptionManager.getAll();
            filteredSubscriptions = [...allSubscriptions];
            updateUI();
        }

        // Set up event listeners
        setupEventListeners();

        // Listen for data changes
        window.addEventListener('subscriptionAdded', refreshData);
        window.addEventListener('subscriptionUpdated', refreshData);
        window.addEventListener('subscriptionDeleted', refreshData);
        window.addEventListener('subscriptionsReset', refreshData);
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('subscription-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentSearch = e.target.value;
                    applyFilters();
                }, 300);
            });
        }

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Update active state
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active', 'filter-chip'));
                btn.classList.add('active', 'filter-chip');
                currentFilter = btn.dataset.filter;
                applyFilters();
            });
        });

        // Sort buttons
        document.querySelectorAll('[data-sort]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sortBy = btn.dataset.sort;
                if (currentSort === sortBy) {
                    // Toggle order
                    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort = sortBy;
                    currentSortOrder = 'asc';
                }
                applyFilters();
            });
        });

        // Subscription row clicks
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.subscription-actions');
            if (actionBtn) {
                e.stopPropagation();
                const subscriptionId = actionBtn.dataset.subscriptionId;
                if (subscriptionId && window.SubscriptionUI) {
                    window.SubscriptionUI.showSubscriptionDetail(subscriptionId);
                }
            }
        });

        // Reset data button
        const resetBtn = document.getElementById('reset-data-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (window.SubscriptionManager && window.SubscriptionUI) {
                    const confirmed = await window.SubscriptionUI.showConfirmation({
                        title: 'Reset Data',
                        message: 'This will reset all subscriptions to the default mock data. Are you sure?',
                        confirmText: 'Reset',
                        type: 'warning'
                    });
                    if (confirmed) {
                        window.SubscriptionManager.resetToMocks();
                        refreshData();
                    }
                }
            });
        }
    }

    /**
     * Apply current filters and sort
     */
    function applyFilters() {
        if (!window.SubscriptionManager) return;

        // Filter
        filteredSubscriptions = window.SubscriptionManager.filter({
            search: currentSearch,
            status: currentFilter
        });

        // Sort
        filteredSubscriptions = window.SubscriptionManager.sort(
            filteredSubscriptions,
            currentSort,
            currentSortOrder
        );

        updateUI();
    }

    /**
     * Refresh data from storage
     */
    function refreshData() {
        if (window.SubscriptionManager) {
            allSubscriptions = window.SubscriptionManager.getAll();
            applyFilters();
        }
    }

    /**
     * Update UI with current data
     */
    function updateUI() {
        updateStats();
        updateTable();
    }

    /**
     * Update statistics cards
     */
    function updateStats() {
        if (!window.SubscriptionManager) return;
        
        const stats = window.SubscriptionManager.getStats();
        
        // Update monthly total
        const monthlyEl = document.getElementById('stat-monthly');
        if (monthlyEl) {
            monthlyEl.textContent = '$' + stats.monthlyTotal;
        }

        // Update count
        const countEl = document.getElementById('stat-count');
        if (countEl) {
            countEl.textContent = stats.active;
        }

        // Update yearly projection
        const yearlyEl = document.getElementById('stat-yearly');
        if (yearlyEl) {
            yearlyEl.textContent = '$' + stats.yearlyTotal;
        }
    }

    /**
     * Update subscriptions table
     */
    function updateTable() {
        const tbody = document.querySelector('#subscriptions-table tbody');
        if (!tbody) return;

        // Show skeleton loading state
        const skeletonRows = Array.from({ length: 3 }, (_, i) => `
            <tr>
                <td class="ps-4 py-3">
                    <div class="skeleton-row">
                        <div class="skeleton skeleton-avatar"></div>
                        <div style="flex: 1;">
                            <div class="skeleton skeleton-text" style="width: 150px; height: 18px; margin-bottom: 8px;"></div>
                            <div class="skeleton skeleton-text" style="width: 100px; height: 14px;"></div>
                        </div>
                    </div>
                </td>
                <td class="py-3">
                    <div class="skeleton skeleton-text" style="width: 60px; height: 20px;"></div>
                </td>
                <td class="py-3">
                    <div class="skeleton skeleton-text" style="width: 80px; height: 24px;"></div>
                </td>
                <td class="py-3">
                    <div class="skeleton skeleton-text" style="width: 100px; height: 18px; margin-bottom: 6px;"></div>
                    <div class="skeleton skeleton-text" style="width: 70px; height: 14px;"></div>
                </td>
                <td class="pe-4 text-end">
                    <div class="skeleton" style="width: 24px; height: 24px; margin-left: auto;"></div>
                </td>
            </tr>
        `).join('');
        
        tbody.innerHTML = skeletonRows;

        // Simulate async loading (300ms delay)
        setTimeout(() => {
            if (filteredSubscriptions.length === 0) {
                // Check if it's a search/filter with no results vs truly empty
                const isFiltered = currentSearch || currentFilter !== 'all';
                
                if (isFiltered) {
                    // No results for current filter/search
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" class="py-5">
                                <div class="empty-state">
                                    <div class="empty-state-icon">
                                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <circle cx="28" cy="28" r="16" stroke="currentColor" stroke-width="2" fill="none"/>
                                            <path d="M40 40L52 52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                    </div>
                                    <h3 class="empty-state-title">No Subscriptions Found</h3>
                                    <p class="empty-state-message">Try adjusting your search or filters to find what you're looking for.</p>
                                </div>
                            </td>
                        </tr>
                    `;
                } else {
                    // Truly empty - new user
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" class="py-5">
                                <div class="empty-state">
                                    <div class="empty-state-icon">
                                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <rect x="8" y="16" width="48" height="36" rx="4" stroke="currentColor" stroke-width="2" fill="none"/>
                                            <path d="M8 28H20L24 36H40L44 28H56" stroke="currentColor" stroke-width="2" fill="none"/>
                                            <circle cx="32" cy="36" r="2" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <h3 class="empty-state-title">No Subscriptions Yet</h3>
                                    <p class="empty-state-message">Start tracking your recurring expenses by adding your first subscription.</p>
                                    <a href="/AddSubscription" class="btn btn-primary rounded-pill px-5 py-3 mt-3">
                                        <i class="bi bi-plus-lg me-2" aria-hidden="true"></i>
                                        Add First Subscription
                                    </a>
                                </div>
                            </td>
                        </tr>
                    `;
                }
                return;
            }

            tbody.innerHTML = filteredSubscriptions.map(sub => {
                const isUrgent = window.daysUntil(sub.nextPaymentDate) <= 3;
                const colorClass = getColorClass(sub.serviceName);
                const initial = sub.serviceName.charAt(0).toUpperCase();
                const daysUntilPayment = window.daysUntil(sub.nextPaymentDate);
                const timeText = getTimeRemaining(daysUntilPayment);
                
                const statusBadge = {
                    active: '<span class="status-badge status-badge-active"><span class="status-dot"></span>Active</span>',
                    paused: '<span class="status-badge status-badge-paused"><span class="status-dot"></span>Paused</span>',
                    expired: '<span class="status-badge status-badge-expired"><span class="status-dot"></span>Expired</span>',
                    trial: '<span class="status-badge status-badge-trial"><span class="status-dot"></span>Trial</span>'
                }[sub.status] || '';

                return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);" class="transition-colors" data-subscription-id="${sub.id}">
                        <td class="ps-4 py-3">
                            <div class="d-flex align-items-center gap-3">
                                <div class="service-icon ${colorClass}">${initial}</div>
                                <div>
                                    <div class="fw-bold text-white">${sub.serviceName}</div>
                                    <div class="small text-muted">${sub.category}</div>
                                </div>
                            </div>
                        </td>
                        <td class="py-3" data-label="Price / Status">
                            <div class="fw-bold font-monospace">$${sub.price}</div>
                            ${statusBadge}
                        </td>
                        <td class="py-3" data-label="Billing Cycle">
                            <span class="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 rounded-pill fw-normal px-3">
                                ${sub.billingCycle}
                            </span>
                        </td>
                        <td class="py-3" data-label="Next Payment">
                            <span class="${isUrgent ? 'text-danger fw-bold' : 'text-white'}">${timeText}</span>
                            <small class="text-muted d-block" style="font-size: 0.75rem;">${window.formatDate(sub.nextPaymentDate)}</small>
                        </td>
                        <td class="pe-4 text-end" data-label="Actions">
                            <button class="btn btn-sm btn-link text-muted subscription-actions" data-subscription-id="${sub.id}" aria-label="View ${sub.serviceName} details">
                                <i class="bi bi-three-dots"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }, 200);
    }

    /**
     * Get color class for service icon
     */
    function getColorClass(name) {
        const len = name.length;
        if (len % 4 === 0) return 'bg-indigo-subtle';
        if (len % 4 === 1) return 'bg-rose-subtle';
        if (len % 4 === 2) return 'bg-emerald-subtle';
        return 'bg-amber-subtle';
    }

    /**
     * Get time remaining text
     */
    function getTimeRemaining(days) {
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days <= 7) return `In ${days} days`;
        const weeks = Math.floor(days / 7);
        if (weeks === 1) return 'In 1 week';
        if (weeks < 4) return `In ${weeks} weeks`;
        return 'Later';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        initDashboard();
    }

})();

