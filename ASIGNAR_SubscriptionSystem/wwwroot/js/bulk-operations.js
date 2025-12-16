/**
 * Bulk Operations Manager
 * Multi-select and bulk actions for subscriptions
 */

(function(window) {
    'use strict';

    const BulkOperations = {
        selectedIds: new Set(),
        isSelectionMode: false,
        
        /**
         * Initialize bulk operations
         */
        init: function() {
            this.attachEventListeners();
        },
        
        /**
         * Attach event listeners
         */
        attachEventListeners: function() {
            document.addEventListener('click', (e) => {
                // Toggle selection mode
                if (e.target.closest('#bulk-toggle-btn')) {
                    this.toggleSelectionMode();
                }
                
                // Select all
                if (e.target.closest('#select-all-checkbox')) {
                    this.toggleSelectAll();
                }
                
                // Individual checkbox
                const checkbox = e.target.closest('.subscription-checkbox');
                if (checkbox) {
                    const id = checkbox.dataset.id;
                    this.toggleSelection(id);
                }
                
                // Bulk actions
                const bulkAction = e.target.closest('[data-bulk-action]');
                if (bulkAction) {
                    const action = bulkAction.dataset.bulkAction;
                    this.performBulkAction(action);
                }
                
                // Cancel bulk mode
                if (e.target.closest('[data-action="cancel-bulk"]')) {
                    this.exitSelectionMode();
                }
            });
        },
        
        /**
         * Toggle selection mode
         */
        toggleSelectionMode: function() {
            this.isSelectionMode = !this.isSelectionMode;
            
            if (this.isSelectionMode) {
                this.enterSelectionMode();
            } else {
                this.exitSelectionMode();
            }
        },
        
        /**
         * Enter selection mode
         */
        enterSelectionMode: function() {
            this.isSelectionMode = true;
            this.selectedIds.clear();
            
            // Add selection mode class
            document.getElementById('subscriptions-table')?.classList.add('selection-mode');
            
            // Show bulk action bar
            this.showBulkActionBar();
            
            // Add checkboxes to table
            this.addCheckboxes();
        },
        
        /**
         * Exit selection mode
         */
        exitSelectionMode: function() {
            this.isSelectionMode = false;
            this.selectedIds.clear();
            
            // Remove selection mode class
            document.getElementById('subscriptions-table')?.classList.remove('selection-mode');
            
            // Hide bulk action bar
            this.hideBulkActionBar();
            
            // Remove checkboxes
            this.removeCheckboxes();
        },
        
        /**
         * Add checkboxes to table
         */
        addCheckboxes: function() {
            const tbody = document.querySelector('#subscriptions-table tbody');
            if (!tbody) return;
            
            const rows = tbody.querySelectorAll('tr[data-subscription-id]');
            rows.forEach(row => {
                const id = row.dataset.subscriptionId;
                if (!id) return;
                
                const firstCell = row.querySelector('td:first-child');
                if (!firstCell) return;
                
                // Create checkbox
                const checkbox = document.createElement('div');
                checkbox.className = 'subscription-checkbox-wrapper';
                checkbox.innerHTML = `
                    <input type="checkbox" 
                           class="subscription-checkbox form-check-input" 
                           data-id="${id}"
                           id="checkbox-${id}">
                    <label for="checkbox-${id}" class="checkbox-label"></label>
                `;
                
                firstCell.insertBefore(checkbox, firstCell.firstChild);
            });
            
            // Add header checkbox
            const thead = document.querySelector('#subscriptions-table thead tr th:first-child');
            if (thead) {
                thead.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <input type="checkbox" 
                               class="form-check-input" 
                               id="select-all-checkbox">
                        <span>Service</span>
                    </div>
                ` + thead.innerHTML;
            }
        },
        
        /**
         * Remove checkboxes from table
         */
        removeCheckboxes: function() {
            document.querySelectorAll('.subscription-checkbox-wrapper').forEach(el => el.remove());
            
            // Reset header
            const thead = document.querySelector('#subscriptions-table thead tr th:first-child');
            if (thead) {
                thead.innerHTML = 'Service';
            }
        },
        
        /**
         * Toggle selection for a subscription
         */
        toggleSelection: function(id) {
            if (this.selectedIds.has(id)) {
                this.selectedIds.delete(id);
            } else {
                this.selectedIds.add(id);
            }
            
            this.updateUI();
        },
        
        /**
         * Toggle select all
         */
        toggleSelectAll: function() {
            const checkbox = document.getElementById('select-all-checkbox');
            if (!checkbox) return;
            
            if (checkbox.checked) {
                this.selectAll();
            } else {
                this.deselectAll();
            }
        },
        
        /**
         * Select all visible subscriptions
         */
        selectAll: function() {
            const rows = document.querySelectorAll('#subscriptions-table tbody tr[data-subscription-id]');
            rows.forEach(row => {
                const id = row.dataset.subscriptionId;
                if (id) this.selectedIds.add(id);
            });
            
            this.updateUI();
        },
        
        /**
         * Deselect all
         */
        deselectAll: function() {
            this.selectedIds.clear();
            this.updateUI();
        },
        
        /**
         * Update UI based on selection
         */
        updateUI: function() {
            // Update checkboxes
            document.querySelectorAll('.subscription-checkbox').forEach(checkbox => {
                checkbox.checked = this.selectedIds.has(checkbox.dataset.id);
            });
            
            // Update select all checkbox
            const selectAllCheckbox = document.getElementById('select-all-checkbox');
            if (selectAllCheckbox) {
                const totalVisible = document.querySelectorAll('.subscription-checkbox').length;
                selectAllCheckbox.checked = this.selectedIds.size === totalVisible && totalVisible > 0;
            }
            
            // Update bulk action bar
            this.updateBulkActionBar();
        },
        
        /**
         * Show bulk action bar
         */
        showBulkActionBar: function() {
            let bar = document.getElementById('bulk-action-bar');
            
            if (!bar) {
                bar = document.createElement('div');
                bar.id = 'bulk-action-bar';
                bar.className = 'bulk-action-bar slide-up';
                document.body.appendChild(bar);
            }
            
            this.updateBulkActionBar();
            setTimeout(() => bar.classList.add('show'), 10);
        },
        
        /**
         * Hide bulk action bar
         */
        hideBulkActionBar: function() {
            const bar = document.getElementById('bulk-action-bar');
            if (bar) {
                bar.classList.remove('show');
                setTimeout(() => bar.remove(), 300);
            }
        },
        
        /**
         * Update bulk action bar content
         */
        updateBulkActionBar: function() {
            const bar = document.getElementById('bulk-action-bar');
            if (!bar) return;
            
            const count = this.selectedIds.size;
            
            bar.innerHTML = `
                <div class="bulk-action-content">
                    <div class="bulk-selection-info">
                        <strong>${count}</strong> ${count === 1 ? 'subscription' : 'subscriptions'} selected
                    </div>
                    <div class="bulk-actions">
                        <button class="btn btn-sm btn-dark rounded-pill" data-bulk-action="pause" ${count === 0 ? 'disabled' : ''}>
                            <i class="bi bi-pause"></i> Pause
                        </button>
                        <button class="btn btn-sm btn-dark rounded-pill" data-bulk-action="resume" ${count === 0 ? 'disabled' : ''}>
                            <i class="bi bi-play"></i> Resume
                        </button>
                        <button class="btn btn-sm btn-primary rounded-pill" data-bulk-action="export" ${count === 0 ? 'disabled' : ''}>
                            <i class="bi bi-download"></i> Export
                        </button>
                        <button class="btn btn-sm btn-danger rounded-pill" data-bulk-action="delete" ${count === 0 ? 'disabled' : ''}>
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                    <button class="btn btn-sm btn-link text-muted" data-action="cancel-bulk">
                        Cancel
                    </button>
                </div>
            `;
        },
        
        /**
         * Perform bulk action
         */
        performBulkAction: async function(action) {
            if (this.selectedIds.size === 0) return;
            
            const count = this.selectedIds.size;
            const ids = Array.from(this.selectedIds);
            
            switch(action) {
                case 'pause':
                    await this.bulkPause(ids, count);
                    break;
                case 'resume':
                    await this.bulkResume(ids, count);
                    break;
                case 'export':
                    this.bulkExport(ids);
                    break;
                case 'delete':
                    await this.bulkDelete(ids, count);
                    break;
            }
        },
        
        /**
         * Bulk pause subscriptions
         */
        bulkPause: async function(ids, count) {
            const confirmed = await window.SubscriptionUI?.showConfirmation({
                title: 'Pause Subscriptions',
                message: `Are you sure you want to pause ${count} subscription${count > 1 ? 's' : ''}?`,
                confirmText: 'Pause All',
                type: 'warning'
            });
            
            if (!confirmed) return;
            
            ids.forEach(id => {
                window.SubscriptionManager?.update(id, { status: 'paused' });
            });
            
            window.SubscriptionUI?.showNotification(`${count} subscription${count > 1 ? 's' : ''} paused`, 'success');
            this.exitSelectionMode();
        },
        
        /**
         * Bulk resume subscriptions
         */
        bulkResume: async function(ids, count) {
            ids.forEach(id => {
                window.SubscriptionManager?.update(id, { status: 'active' });
            });
            
            window.SubscriptionUI?.showNotification(`${count} subscription${count > 1 ? 's' : ''} resumed`, 'success');
            this.exitSelectionMode();
        },
        
        /**
         * Bulk export subscriptions
         */
        bulkExport: function(ids) {
            const subscriptions = ids.map(id => window.SubscriptionManager?.getById(id)).filter(Boolean);
            
            // Create CSV
            const csv = this.exportToCSV(subscriptions);
            
            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            
            window.SubscriptionUI?.showNotification('Subscriptions exported successfully', 'success');
        },
        
        /**
         * Export to CSV format
         */
        exportToCSV: function(subscriptions) {
            const headers = ['Service Name', 'Category', 'Price', 'Billing Cycle', 'Next Payment', 'Status', 'Auto Renew'];
            const rows = subscriptions.map(sub => [
                sub.serviceName,
                sub.category,
                sub.price,
                sub.billingCycle,
                sub.nextPaymentDate,
                sub.status,
                sub.autoRenew ? 'Yes' : 'No'
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');
            
            return csvContent;
        },
        
        /**
         * Bulk delete subscriptions
         */
        bulkDelete: async function(ids, count) {
            const confirmed = await window.SubscriptionUI?.showConfirmation({
                title: 'Delete Subscriptions',
                message: `Are you sure you want to permanently delete ${count} subscription${count > 1 ? 's' : ''}? This action cannot be undone.`,
                confirmText: 'Yes, Delete All',
                type: 'danger',
                icon: 'bi-exclamation-triangle'
            });
            
            if (!confirmed) return;
            
            ids.forEach(id => {
                window.SubscriptionManager?.delete(id);
            });
            
            window.SubscriptionUI?.showNotification(`${count} subscription${count > 1 ? 's' : ''} deleted`, 'success');
            this.exitSelectionMode();
        }
    };
    
    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
        BulkOperations.init();
    });
    
    // Export to window
    window.BulkOperations = BulkOperations;
    
})(window);
