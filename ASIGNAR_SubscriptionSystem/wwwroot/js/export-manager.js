/**
 * Calendar Export & CSV Handler
 * Export subscriptions to calendar (.ics) and CSV format
 */

(function(window) {
    'use strict';

    const ExportManager = {
        
        /**
         * Export subscription to calendar (.ics format)
         */
        exportToCalendar: function(subscriptionId) {
            const sub = window.SubscriptionManager?.getById(subscriptionId);
            if (!sub) return;
            
            const icsContent = this.generateICS(sub);
            this.downloadFile(icsContent, `${sub.serviceName}-subscription.ics`, 'text/calendar');
            
            window.SubscriptionUI?.showNotification('Calendar event exported', 'success');
        },
        
        /**
         * Generate ICS file content
         */
        generateICS: function(subscription) {
            const now = new Date();
            const eventDate = new Date(subscription.nextPaymentDate);
            
            // Format dates for ICS (YYYYMMDDTHHMMSS)
            const formatDate = (date) => {
                const pad = (n) => String(n).padStart(2, '0');
                return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
            };
            
            const dtstart = formatDate(eventDate);
            const dtstamp = formatDate(now);
            
            // Determine recurring rule based on billing cycle
            const rrule = subscription.billingCycle === 'Monthly' ? 'FREQ=MONTHLY;INTERVAL=1' :
                         subscription.billingCycle === 'Yearly' ? 'FREQ=YEARLY;INTERVAL=1' :
                         subscription.billingCycle === 'Weekly' ? 'FREQ=WEEKLY;INTERVAL=1' : '';
            
            const ics = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Subscription System//EN',
                'CALSCALE:GREGORIAN',
                'BEGIN:VEVENT',
                `UID:subscription-${subscription.id}@subscriptionsystem.app`,
                `DTSTAMP:${dtstamp}`,
                `DTSTART:${dtstart}`,
                `SUMMARY:${subscription.serviceName} Payment - $${subscription.price}`,
                `DESCRIPTION:${subscription.billingCycle} subscription payment for ${subscription.serviceName}`,
                `LOCATION:Online`,
                `STATUS:CONFIRMED`,
                rrule ? `RRULE:${rrule}` : '',
                'BEGIN:VALARM',
                'TRIGGER:-PT24H',
                'DESCRIPTION:Payment due tomorrow',
                'ACTION:DISPLAY',
                'END:VALARM',
                'END:VEVENT',
                'END:VCALENDAR'
            ].filter(line => line).join('\r\n');
            
            return ics;
        },
        
        /**
         * Export all subscriptions to CSV
         */
        exportAllToCSV: function() {
            const subscriptions = window.SubscriptionManager?.getAll();
            if (!subscriptions || subscriptions.length === 0) {
                window.SubscriptionUI?.showNotification('No subscriptions to export', 'warning');
                return;
            }
            
            const csv = this.generateCSV(subscriptions);
            const filename = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(csv, filename, 'text/csv');
            
            window.SubscriptionUI?.showNotification(`Exported ${subscriptions.length} subscriptions`, 'success');
        },
        
        /**
         * Generate CSV content
         */
        generateCSV: function(subscriptions) {
            const headers = [
                'Service Name',
                'Category',
                'Price',
                'Billing Cycle',
                'Next Payment Date',
                'Status',
                'Auto Renew',
                'Plan Tier',
                'Notes'
            ];
            
            const rows = subscriptions.map(sub => [
                this.escapeCSV(sub.serviceName),
                this.escapeCSV(sub.category),
                sub.price,
                this.escapeCSV(sub.billingCycle),
                sub.nextPaymentDate,
                this.escapeCSV(sub.status),
                sub.autoRenew ? 'Yes' : 'No',
                this.escapeCSV(sub.planTier || ''),
                this.escapeCSV(sub.notes || '')
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');
            
            return csvContent;
        },
        
        /**
         * Escape CSV field
         */
        escapeCSV: function(field) {
            if (field == null) return '';
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        },
        
        /**
         * Import CSV file
         */
        importFromCSV: function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv';
            
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const csv = event.target.result;
                        const subscriptions = this.parseCSV(csv);
                        this.showImportPreview(subscriptions);
                    } catch (error) {
                        window.SubscriptionUI?.showNotification('Failed to parse CSV: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            });
            
            input.click();
        },
        
        /**
         * Parse CSV content
         */
        parseCSV: function(csv) {
            const lines = csv.split('\n').filter(line => line.trim());
            if (lines.length < 2) throw new Error('CSV file is empty');
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const subscriptions = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                const subscription = {
                    id: 'sub-' + Date.now() + '-' + i,
                    serviceName: values[0] || '',
                    category: values[1] || 'Personal',
                    price: parseFloat(values[2]) || 0,
                    billingCycle: values[3] || 'Monthly',
                    nextPaymentDate: values[4] || new Date().toISOString().split('T')[0],
                    status: (values[5] || 'active').toLowerCase(),
                    autoRenew: values[6] === 'Yes',
                    planTier: values[7] || 'Standard',
                    notes: values[8] || ''
                };
                
                if (subscription.serviceName) {
                    subscriptions.push(subscription);
                }
            }
            
            return subscriptions;
        },
        
        /**
         * Parse CSV line with quoted fields
         */
        parseCSVLine: function(line) {
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];
                
                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            
            values.push(current.trim());
            return values;
        },
        
        /**
         * Show import preview modal
         */
        showImportPreview: function(subscriptions) {
            const backdrop = document.createElement('div');
            backdrop.className = 'custom-modal-backdrop fade-in';
            
            const modal = document.createElement('div');
            modal.className = 'confirmation-modal slide-up';
            modal.style.maxWidth = '800px';
            modal.style.maxHeight = '90vh';
            modal.style.overflowY = 'auto';
            
            modal.innerHTML = `
                <div class="modal-content glass-card">
                    <div class="modal-header">
                        <h5 class="modal-title">Import Preview</h5>
                        <button class="btn-close modal-close" data-action="close" aria-label="Close">×</button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-3">Found ${subscriptions.length} subscriptions. Review before importing:</p>
                        <div style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Cycle</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${subscriptions.map(sub => `
                                        <tr>
                                            <td>${sub.serviceName}</td>
                                            <td>${sub.category}</td>
                                            <td>$${sub.price}</td>
                                            <td>${sub.billingCycle}</td>
                                            <td>${sub.status}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-dark rounded-pill px-4" data-action="close">Cancel</button>
                        <button class="btn btn-primary rounded-pill px-4" data-action="import">Import All</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
            
            // Handle actions
            modal.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                
                if (action === 'close') {
                    cleanup();
                } else if (action === 'import') {
                    this.confirmImport(subscriptions);
                    cleanup();
                }
            });
            
            const cleanup = () => {
                backdrop.remove();
                modal.remove();
            };
            
            backdrop.addEventListener('click', cleanup);
        },
        
        /**
         * Confirm and execute import
         */
        confirmImport: function(subscriptions) {
            subscriptions.forEach(sub => {
                window.SubscriptionManager?.add(sub);
            });
            
            window.SubscriptionUI?.showNotification(`Imported ${subscriptions.length} subscriptions successfully`, 'success');
            
            // Refresh page after delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        
        /**
         * Download file
         */
        downloadFile: function(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }
    };
    
    // Add export buttons to subscription detail modal
    document.addEventListener('DOMContentLoaded', () => {
        // Listen for modal opens and add export button
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('detail-modal')) {
                        addExportButtons(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true });
        
        function addExportButtons(modal) {
            const footer = modal.querySelector('.modal-footer-actions');
            if (!footer) return;
            
            const subscriptionId = modal.querySelector('[data-action="cancel"]')?.closest('.modal-content')?.dataset?.subscriptionId;
            
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-secondary btn-action';
            exportBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 10V13H13V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 3V10M8 10L5 7M8 10L11 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Add to Calendar</span>
            `;
            exportBtn.addEventListener('click', () => {
                const subId = modal.dataset.subscriptionId || subscriptionId;
                if (subId) ExportManager.exportToCalendar(subId);
            });
            
            footer.insertBefore(exportBtn, footer.firstChild);
        }
    });
    
    // Add global export/import buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="export-all-csv"]')) {
            ExportManager.exportAllToCSV();
        } else if (e.target.closest('[data-action="import-csv"]')) {
            ExportManager.importFromCSV();
        }
    });
    
    // Export to window
    window.ExportManager = ExportManager;
    
})(window);
