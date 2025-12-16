/**
* Subscription UI Manager
* UI interactions, modals, and notifications
*/

(function(window) {
    'use strict';

    /**
     * Subscription UI Manager
     * Handles modals, notifications, and UI interactions
     */
    const SubscriptionUI = {

        /**
         * Clean up all custom modals and backdrops
         */
        cleanupModals: function() {
            // Only target custom backdrop, not Bootstrap modals
            const modals = document.querySelectorAll('.confirmation-modal, .detail-modal');
            const backdrops = document.querySelectorAll('.custom-modal-backdrop');
            
            // Immediate removal to prevent blocking
            modals.forEach(modal => {
                if (modal.parentElement) {
                    modal.remove();
                }
            });
            
            backdrops.forEach(backdrop => {
                if (backdrop.parentElement) {
                    backdrop.remove();
                }
            });
        },

        /**
         * Show notification toast
         */
        showNotification: function(message, type = 'success') {
            // Remove existing notifications
            const existing = document.querySelectorAll('.toast-notification');
            existing.forEach(el => el.remove());

            // Create notification element
            const notification = document.createElement('div');
            notification.className = `toast-notification toast-${type} fade-in`;
            notification.setAttribute('role', 'alert');
            notification.setAttribute('aria-live', 'polite');
            
            const icon = {
                success: '<i class="bi bi-check-circle-fill"></i>',
                error: '<i class="bi bi-x-circle-fill"></i>',
                warning: '<i class="bi bi-exclamation-triangle-fill"></i>',
                info: '<i class="bi bi-info-circle-fill"></i>'
            }[type] || '';

            notification.innerHTML = `
                ${icon}
                <span>${message}</span>
                <button class="toast-close" aria-label="Close notification">
                    <i class="bi bi-x"></i>
                </button>
            `;

            document.body.appendChild(notification);

            // Close button handler
            notification.querySelector('.toast-close').addEventListener('click', () => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            });

            // Auto-dismiss after 4 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 300);
                }
            }, 4000);
        },

        /**
         * Show confirmation modal
         */
        showConfirmation: function(options) {
            return new Promise((resolve) => {
                // Clean up any existing custom modals
                this.cleanupModals();

                // Create modal backdrop with custom class
                const backdrop = document.createElement('div');
                backdrop.className = 'custom-modal-backdrop fade-in';
                backdrop.setAttribute('role', 'presentation');

                // Create modal
                const modal = document.createElement('div');
                modal.className = 'confirmation-modal slide-up';
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');
                modal.setAttribute('aria-labelledby', 'modal-title');

                const isDanger = options.type === 'danger';
                const confirmClass = isDanger ? 'btn-danger' : 'btn-primary';
                const icon = options.icon || (isDanger ? 'bi-exclamation-triangle' : 'bi-question-circle');

                modal.innerHTML = `
                    <div class="modal-content glass-card">
                        <div class="modal-header">
                            <div class="modal-icon ${isDanger ? 'text-danger' : 'text-primary'}">
                                <i class="bi ${icon}"></i>
                            </div>
                            <h5 class="modal-title" id="modal-title">${options.title || 'Confirm Action'}</h5>
                        </div>
                        <div class="modal-body">
                            <p>${options.message || 'Are you sure you want to proceed?'}</p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-dark rounded-pill px-4" data-action="cancel">
                                ${options.cancelText || 'Cancel'}
                            </button>
                            <button class="btn ${confirmClass} rounded-pill px-4" data-action="confirm">
                                ${options.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                `;

                document.body.appendChild(backdrop);
                document.body.appendChild(modal);

                // Focus first button for accessibility
                setTimeout(() => {
                    modal.querySelector('[data-action="cancel"]').focus();
                }, 100);

                // Handle button clicks
                const handleClick = (e) => {
                    const action = e.target.closest('[data-action]')?.dataset.action;
                    if (action) {
                        cleanup();
                        resolve(action === 'confirm');
                    }
                };

                // Handle escape key
                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        cleanup();
                        resolve(false);
                    }
                };

                // Cleanup function
                const cleanup = () => {
                    modal.removeEventListener('click', handleClick);
                    document.removeEventListener('keydown', handleEscape);
                    backdrop.classList.add('fade-out');
                    modal.classList.add('fade-out');
                    setTimeout(() => {
                        if (backdrop.parentElement) backdrop.remove();
                        if (modal.parentElement) modal.remove();
                    }, 300);
                };

                modal.addEventListener('click', handleClick);
                document.addEventListener('keydown', handleEscape);

                // Close on backdrop click
                backdrop.addEventListener('click', () => {
                    cleanup();
                    resolve(false);
                });
            });
        },

        /**
         * Show subscription detail modal
         */
        showSubscriptionDetail: function(subscriptionId) {
            const subscription = window.SubscriptionManager.getById(subscriptionId);
            if (!subscription) {
                this.showNotification('Subscription not found', 'error');
                return;
            }

            this.cleanupModals();

            const backdrop = document.createElement('div');
            backdrop.className = 'custom-modal-backdrop fade-in';
            backdrop.setAttribute('role', 'presentation');

            const modal = document.createElement('div');
            modal.className = 'detail-modal slide-up';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'detail-modal-title');
            modal.setAttribute('aria-describedby', 'detail-modal-desc');

            const statusBadgeClass = {
                active: 'status-badge-active',
                paused: 'status-badge-paused',
                expired: 'status-badge-expired',
                trial: 'status-badge-trial'
            }[subscription.status] || 'status-badge-active';

            const statusText = subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);
            const nextPaymentFormatted = new Date(subscription.nextPaymentDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });

            modal.innerHTML = `
                <div class="modal-content glass-card">
                    <div class="modal-header modal-header-detail">
                        <div class="modal-header-content">
                            <h2 class="modal-title" id="detail-modal-title">${subscription.serviceName}</h2>
                            <span class="status-badge ${statusBadgeClass}" role="status" aria-label="Subscription status: ${statusText}">
                                <span class="status-dot" aria-hidden="true"></span>
                                <span class="status-text">${statusText}</span>
                            </span>
                        </div>
                        <button class="btn-close modal-close" data-action="close" aria-label="Close subscription details">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body" id="detail-modal-desc">
                        <section class="detail-section" aria-labelledby="plan-details-heading">
                            <h3 class="detail-section-title" id="plan-details-heading">Plan Details</h3>
                            <dl class="detail-grid">
                                <div class="detail-item">
                                    <dt class="detail-key">Plan Tier</dt>
                                    <dd class="detail-value">${subscription.planTier}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt class="detail-key">Category</dt>
                                    <dd class="detail-value">${subscription.category}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt class="detail-key">Price</dt>
                                    <dd class="detail-value detail-value-price">$${subscription.price}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt class="detail-key">Billing Cycle</dt>
                                    <dd class="detail-value">${subscription.billingCycle}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt class="detail-key">Next Payment</dt>
                                    <dd class="detail-value">${nextPaymentFormatted}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt class="detail-key">Auto-Renew</dt>
                                    <dd class="detail-value">${subscription.autoRenew ? 'Enabled' : 'Disabled'}</dd>
                                </div>
                            </dl>
                        </section>

                        ${subscription.notes ? `
                        <section class="detail-section" aria-labelledby="notes-heading">
                            <h3 class="detail-section-title" id="notes-heading">Notes</h3>
                            <p class="detail-notes">${subscription.notes}</p>
                        </section>
                        ` : ''}

                        <section class="detail-section" aria-labelledby="activity-heading">
                            <h3 class="detail-section-title" id="activity-heading">Recent Activity</h3>
                            <ul class="activity-list" role="list">
                                <li class="activity-item">
                                    <svg class="activity-icon activity-icon-success" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
                                        <path d="M6 10L9 13L14 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span class="activity-desc">Payment processed - $${subscription.price}</span>
                                    <time class="activity-time" datetime="30d"><span class="sr-only">30 days ago</span>30 days ago</time>
                                </li>
                                <li class="activity-item">
                                    <svg class="activity-icon activity-icon-info" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2"/>
                                        <path d="M8 10L10 8L12 10L10 12L8 10Z" fill="currentColor"/>
                                        <path d="M10 8V4M10 16V12M16 10H12M4 10H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <span class="activity-desc">Subscription renewed</span>
                                    <time class="activity-time" datetime="30d"><span class="sr-only">30 days ago</span>30 days ago</time>
                                </li>
                            </ul>
                        </section>
                    </div>
                    <div class="modal-footer modal-footer-actions">
                        ${subscription.status === 'active' ? `
                            <button class="btn btn-secondary btn-action" data-action="pause" aria-label="Pause ${subscription.serviceName} subscription">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor"/>
                                    <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor"/>
                                </svg>
                                <span>Pause</span>
                            </button>
                        ` : ''}
                        ${subscription.status === 'paused' ? `
                            <button class="btn btn-primary btn-action" data-action="resume" aria-label="Resume ${subscription.serviceName} subscription">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M5 3L13 8L5 13V3Z" fill="currentColor"/>
                                </svg>
                                <span>Resume</span>
                            </button>
                        ` : ''}
                        <button class="btn btn-danger btn-action btn-action-destructive" data-action="cancel" aria-label="Cancel ${subscription.serviceName} subscription permanently">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
                                <path d="M10.5 5.5L5.5 10.5M5.5 5.5L10.5 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span>Cancel Subscription</span>
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(backdrop);
            document.body.appendChild(modal);

            // Focus trap implementation
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            // Set initial focus
            setTimeout(() => {
                const closeButton = modal.querySelector('[data-action="close"]');
                if (closeButton) closeButton.focus();
            }, 100);

            // Trap focus within modal
            const trapFocus = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
            };

            modal.addEventListener('keydown', trapFocus);

            // Handle button clicks
            const handleClick = async (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                
                if (action === 'close') {
                    cleanup();
                } else if (action === 'pause') {
                    const confirmed = await this.showConfirmation({
                        title: 'Pause Subscription',
                        message: `Are you sure you want to pause ${subscription.serviceName}?`,
                        confirmText: 'Pause',
                        type: 'warning'
                    });
                    if (confirmed) {
                        window.SubscriptionManager.update(subscriptionId, { status: 'paused' });
                        this.showNotification('Subscription paused', 'success');
                        cleanup();
                    }
                } else if (action === 'resume') {
                    window.SubscriptionManager.update(subscriptionId, { status: 'active' });
                    this.showNotification('Subscription resumed', 'success');
                    cleanup();
                } else if (action === 'cancel') {
                    const confirmed = await this.showConfirmation({
                        title: 'Cancel Subscription',
                        message: `Are you sure you want to cancel ${subscription.serviceName}? This action cannot be undone.`,
                        confirmText: 'Yes, Cancel',
                        type: 'danger',
                        icon: 'bi-exclamation-triangle'
                    });
                    if (confirmed) {
                        window.SubscriptionManager.delete(subscriptionId);
                        this.showNotification('Subscription cancelled', 'success');
                        cleanup();
                    }
                }
            };

            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') cleanup();
            };

            // Cleanup function
            const cleanup = () => {
                modal.removeEventListener('click', handleClick);
                modal.removeEventListener('keydown', trapFocus);
                document.removeEventListener('keydown', handleEscape);
                backdrop.classList.add('fade-out');
                modal.classList.add('fade-out');
                setTimeout(() => {
                    if (backdrop.parentElement) backdrop.remove();
                    if (modal.parentElement) modal.remove();
                }, 300);
            };

            modal.addEventListener('click', handleClick);
            document.addEventListener('keydown', handleEscape);

            // Close on backdrop click
            backdrop.addEventListener('click', cleanup);
        },

        /**
         * Toggle loading state on element
         */
        setLoading: function(element, isLoading) {
            if (isLoading) {
                element.disabled = true;
                element.dataset.originalContent = element.innerHTML;
                element.innerHTML = '<span class="spinner"></span>';
            } else {
                element.disabled = false;
                element.innerHTML = element.dataset.originalContent || element.innerHTML;
            }
        },

        /**
         * Initialize UI event listeners
         */
        init: function() {
            // Global escape key handler for custom modals
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const customModals = document.querySelectorAll('.confirmation-modal, .detail-modal');
                    if (customModals.length > 0) {
                        this.cleanupModals();
                    }
                }
            });

            // Cleanup any orphaned backdrops on page load
            this.cleanupModals();
        }
    };

    // Export to window
    window.SubscriptionUI = SubscriptionUI;

})(window);
