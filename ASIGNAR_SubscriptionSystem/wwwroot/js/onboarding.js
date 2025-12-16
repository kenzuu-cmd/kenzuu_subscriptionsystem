/**
 * Onboarding Wizard
 * First-time user onboarding flow
 */

(function(window) {
    'use strict';

    const ONBOARDING_KEY = 'subscriptionSystem_onboardingCompleted';
    
    const OnboardingWizard = {
        currentStep: 0,
        totalSteps: 4,
        
        /**
         * Check if onboarding should be shown
         */
        shouldShow: function() {
            // Show if never completed and no subscriptions
            const completed = localStorage.getItem(ONBOARDING_KEY);
            const hasSubscriptions = window.SubscriptionManager?.getAll().length > 0;
            return !completed && !hasSubscriptions;
        },
        
        /**
         * Show onboarding wizard
         */
        show: function() {
            if (!this.shouldShow()) return;
            
            this.currentStep = 0;
            this.render();
        },
        
        /**
         * Render current step
         */
        render: function() {
            const steps = [
                this.getWelcomeStep(),
                this.getFeaturesTourStep(),
                this.getAddFirstStep(),
                this.getCompleteStep()
            ];
            
            const backdrop = document.createElement('div');
            backdrop.className = 'onboarding-backdrop fade-in';
            backdrop.id = 'onboarding-backdrop';
            
            const modal = document.createElement('div');
            modal.className = 'onboarding-modal slide-up';
            modal.id = 'onboarding-modal';
            modal.innerHTML = steps[this.currentStep];
            
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
            
            this.attachEventListeners();
        },
        
        /**
         * Welcome step
         */
        getWelcomeStep: function() {
            return `
                <div class="onboarding-content">
                    <div class="onboarding-icon">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="35" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="M40 25V40L50 50" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <h2 class="onboarding-title">Welcome to SubscriptionSystem!</h2>
                    <p class="onboarding-description">
                        Take control of your recurring expenses. Track, manage, and optimize all your subscriptions in one beautiful dashboard.
                    </p>
                    <div class="onboarding-actions">
                        <button class="btn btn-primary btn-lg rounded-pill px-5" data-action="next">
                            Get Started
                            <i class="bi bi-arrow-right ms-2"></i>
                        </button>
                        <button class="btn btn-link text-muted" data-action="skip">Skip Tour</button>
                    </div>
                    <div class="onboarding-progress">
                        <span class="progress-dot active"></span>
                        <span class="progress-dot"></span>
                        <span class="progress-dot"></span>
                        <span class="progress-dot"></span>
                    </div>
                </div>
            `;
        },
        
        /**
         * Features tour step
         */
        getFeaturesTourStep: function() {
            return `
                <div class="onboarding-content">
                    <h2 class="onboarding-title">Powerful Features</h2>
                    <div class="features-grid">
                        <div class="feature-item">
                            <div class="feature-icon bg-indigo-subtle">
                                <i class="bi bi-search"></i>
                            </div>
                            <h4>Smart Search & Filters</h4>
                            <p>Find any subscription instantly with powerful search and filters</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon bg-emerald-subtle">
                                <i class="bi bi-bell"></i>
                            </div>
                            <h4>Payment Reminders</h4>
                            <p>Never miss a payment with smart notifications</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon bg-rose-subtle">
                                <i class="bi bi-graph-up"></i>
                            </div>
                            <h4>Spending Analytics</h4>
                            <p>Visualize your spending patterns and save money</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon bg-amber-subtle">
                                <i class="bi bi-phone"></i>
                            </div>
                            <h4>Mobile Friendly</h4>
                            <p>Manage subscriptions on any device, anywhere</p>
                        </div>
                    </div>
                    <div class="onboarding-actions">
                        <button class="btn btn-dark rounded-pill px-4" data-action="back">
                            <i class="bi bi-arrow-left me-2"></i> Back
                        </button>
                        <button class="btn btn-primary rounded-pill px-5" data-action="next">
                            Next <i class="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>
                    <div class="onboarding-progress">
                        <span class="progress-dot"></span>
                        <span class="progress-dot active"></span>
                        <span class="progress-dot"></span>
                        <span class="progress-dot"></span>
                    </div>
                </div>
            `;
        },
        
        /**
         * Add first subscription step
         */
        getAddFirstStep: function() {
            return `
                <div class="onboarding-content">
                    <div class="onboarding-icon">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="35" stroke="currentColor" stroke-width="2"/>
                            <path d="M40 25V55M25 40H55" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <h2 class="onboarding-title">Ready to Start?</h2>
                    <p class="onboarding-description">
                        Let's add your first subscription to get started. Don't worry, you can add more later!
                    </p>
                    <div class="quick-add-suggestions">
                        <h4 class="text-muted small text-uppercase mb-3">Popular Services</h4>
                        <div class="suggestion-grid">
                            <button class="suggestion-btn" data-service="Netflix" data-price="15.99" data-category="Entertainment">
                                <span class="suggestion-name">Netflix</span>
                                <span class="suggestion-price">$15.99</span>
                            </button>
                            <button class="suggestion-btn" data-service="Spotify" data-price="10.99" data-category="Entertainment">
                                <span class="suggestion-name">Spotify</span>
                                <span class="suggestion-price">$10.99</span>
                            </button>
                            <button class="suggestion-btn" data-service="Adobe CC" data-price="54.99" data-category="Work">
                                <span class="suggestion-name">Adobe CC</span>
                                <span class="suggestion-price">$54.99</span>
                            </button>
                            <button class="suggestion-btn" data-service="GitHub Pro" data-price="4.00" data-category="Work">
                                <span class="suggestion-name">GitHub Pro</span>
                                <span class="suggestion-price">$4.00</span>
                            </button>
                        </div>
                    </div>
                    <div class="onboarding-actions">
                        <button class="btn btn-dark rounded-pill px-4" data-action="back">
                            <i class="bi bi-arrow-left me-2"></i> Back
                        </button>
                        <button class="btn btn-secondary rounded-pill px-4" data-action="custom-add">
                            Add Custom
                        </button>
                    </div>
                    <div class="onboarding-progress">
                        <span class="progress-dot"></span>
                        <span class="progress-dot"></span>
                        <span class="progress-dot active"></span>
                        <span class="progress-dot"></span>
                    </div>
                </div>
            `;
        },
        
        /**
         * Complete step
         */
        getCompleteStep: function() {
            return `
                <div class="onboarding-content">
                    <div class="onboarding-icon success-icon">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="35" stroke="currentColor" stroke-width="2"/>
                            <path d="M25 40L35 50L55 30" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h2 class="onboarding-title">You're All Set!</h2>
                    <p class="onboarding-description">
                        Congratulations! You're ready to take control of your subscriptions. Here are some tips to get the most out of SubscriptionSystem:
                    </p>
                    <ul class="tips-list">
                        <li><i class="bi bi-check-circle text-success me-2"></i> Use filters to organize subscriptions by status</li>
                        <li><i class="bi bi-check-circle text-success me-2"></i> Check Reports page for spending insights</li>
                        <li><i class="bi bi-check-circle text-success me-2"></i> Set up notifications in Settings</li>
                        <li><i class="bi bi-check-circle text-success me-2"></i> Export data anytime for budgeting</li>
                    </ul>
                    <div class="onboarding-actions">
                        <button class="btn btn-primary btn-lg rounded-pill px-5" data-action="finish">
                            Go to Dashboard
                            <i class="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>
                    <div class="onboarding-progress">
                        <span class="progress-dot"></span>
                        <span class="progress-dot"></span>
                        <span class="progress-dot"></span>
                        <span class="progress-dot active"></span>
                    </div>
                </div>
            `;
        },
        
        /**
         * Attach event listeners
         */
        attachEventListeners: function() {
            const modal = document.getElementById('onboarding-modal');
            if (!modal) return;
            
            modal.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                
                if (action === 'next') {
                    this.nextStep();
                } else if (action === 'back') {
                    this.prevStep();
                } else if (action === 'skip') {
                    this.skip();
                } else if (action === 'finish') {
                    this.complete();
                } else if (action === 'custom-add') {
                    this.complete();
                    window.location.href = '/AddSubscription';
                }
                
                // Handle quick-add suggestions
                const suggestionBtn = e.target.closest('.suggestion-btn');
                if (suggestionBtn) {
                    this.quickAddSubscription(suggestionBtn.dataset);
                }
            });
        },
        
        /**
         * Next step
         */
        nextStep: function() {
            if (this.currentStep < this.totalSteps - 1) {
                this.currentStep++;
                this.update();
            }
        },
        
        /**
         * Previous step
         */
        prevStep: function() {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.update();
            }
        },
        
        /**
         * Update current view
         */
        update: function() {
            const modal = document.getElementById('onboarding-modal');
            if (modal) {
                modal.classList.add('fade-out');
                setTimeout(() => {
                    this.cleanup();
                    this.render();
                }, 200);
            }
        },
        
        /**
         * Quick add subscription from suggestion
         */
        quickAddSubscription: function(data) {
            if (!window.SubscriptionManager) return;
            
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            
            const subscription = {
                serviceName: data.service,
                price: parseFloat(data.price),
                category: data.category,
                billingCycle: 'Monthly',
                nextPaymentDate: nextMonth.toISOString().split('T')[0],
                status: 'active',
                autoRenew: true,
                planTier: 'Standard'
            };
            
            window.SubscriptionManager.add(subscription);
            window.SubscriptionUI?.showNotification(`${data.service} added successfully!`, 'success');
            
            this.nextStep();
        },
        
        /**
         * Skip onboarding
         */
        skip: function() {
            localStorage.setItem(ONBOARDING_KEY, 'skipped');
            this.cleanup();
        },
        
        /**
         * Complete onboarding
         */
        complete: function() {
            localStorage.setItem(ONBOARDING_KEY, 'completed');
            this.cleanup();
            
            // Refresh page to show dashboard
            if (window.location.pathname === '/Index' || window.location.pathname === '/') {
                window.location.reload();
            }
        },
        
        /**
         * Cleanup modals
         */
        cleanup: function() {
            const backdrop = document.getElementById('onboarding-backdrop');
            const modal = document.getElementById('onboarding-modal');
            
            if (backdrop) backdrop.remove();
            if (modal) modal.remove();
        },
        
        /**
         * Reset onboarding (for testing)
         */
        reset: function() {
            localStorage.removeItem(ONBOARDING_KEY);
            console.log('? Onboarding reset. Reload to see wizard again.');
        }
    };
    
    // Auto-show on page load if needed
    window.addEventListener('DOMContentLoaded', () => {
        // Only show on dashboard/index page
        if (window.location.pathname === '/Index' || window.location.pathname === '/') {
            setTimeout(() => {
                OnboardingWizard.show();
            }, 500);
        }
    });
    
    // Export to window
    window.OnboardingWizard = OnboardingWizard;
    
})(window);
