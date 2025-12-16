/**
 * Analytics Charts
 * Interactive spending analytics with Chart.js
 */

(function(window) {
    'use strict';

    const Analytics = {
        charts: {},
        dateRange: 'last6months',
        
        /**
         * Initialize analytics
         */
        init: function() {
            // Only initialize on Reports page
            if (!document.getElementById('analytics-container')) return;
            
            this.loadCharts();
            this.attachEventListeners();
        },
        
        /**
         * Attach event listeners
         */
        attachEventListeners: function() {
            // Date range selector
            document.querySelectorAll('[data-date-range]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.dateRange = btn.dataset.dateRange;
                    document.querySelectorAll('[data-date-range]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.updateCharts();
                });
            });
            
            // Export chart buttons
            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-export-chart]')) {
                    const chartId = e.target.closest('[data-export-chart]').dataset.exportChart;
                    this.exportChart(chartId);
                }
            });
        },
        
        /**
         * Load all charts
         */
        loadCharts: function() {
            this.createSpendingTrendChart();
            this.createCategoryPieChart();
            this.createTopSubscriptionsChart();
        },
        
        /**
         * Update all charts
         */
        updateCharts: function() {
            Object.keys(this.charts).forEach(key => {
                if (this.charts[key]) {
                    this.charts[key].destroy();
                }
            });
            this.loadCharts();
        },
        
        /**
         * Get data based on date range
         */
        getData: function() {
            if (!window.SubscriptionManager) return null;
            
            const subscriptions = window.SubscriptionManager.getAll();
            const now = new Date();
            const months = this.dateRange === 'last3months' ? 3 : 
                          this.dateRange === 'last6months' ? 6 : 12;
            
            // Generate monthly data
            const monthlyData = [];
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                
                // Calculate total for this month
                const total = subscriptions.reduce((sum, sub) => {
                    if (sub.status === 'active') {
                        const monthly = sub.billingCycle === 'Monthly' ? sub.price :
                                       sub.billingCycle === 'Yearly' ? sub.price / 12 :
                                       sub.billingCycle === 'Weekly' ? sub.price * 4 : sub.price;
                        return sum + monthly;
                    }
                    return sum;
                }, 0);
                
                monthlyData.push({
                    month: monthName,
                    total: parseFloat(total.toFixed(2))
                });
            }
            
            // Category breakdown
            const categoryData = {};
            subscriptions.forEach(sub => {
                if (sub.status === 'active') {
                    const category = sub.category;
                    const monthly = sub.billingCycle === 'Monthly' ? sub.price :
                                   sub.billingCycle === 'Yearly' ? sub.price / 12 :
                                   sub.billingCycle === 'Weekly' ? sub.price * 4 : sub.price;
                    
                    categoryData[category] = (categoryData[category] || 0) + monthly;
                }
            });
            
            // Top subscriptions
            const topSubs = subscriptions
                .filter(sub => sub.status === 'active')
                .sort((a, b) => b.price - a.price)
                .slice(0, 5);
            
            return {
                monthly: monthlyData,
                categories: categoryData,
                topSubscriptions: topSubs
            };
        },
        
        /**
         * Create spending trend line chart
         */
        createSpendingTrendChart: function() {
            const canvas = document.getElementById('spending-trend-chart');
            if (!canvas) return;
            
            const data = this.getData();
            if (!data) return;
            
            const ctx = canvas.getContext('2d');
            
            this.charts.spendingTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.monthly.map(d => d.month),
                    datasets: [{
                        label: 'Monthly Spending',
                        data: data.monthly.map(d => d.total),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            padding: 12,
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                            borderWidth: 1,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return '$' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#9ca3af'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#9ca3af',
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    }
                }
            });
        },
        
        /**
         * Create category pie chart
         */
        createCategoryPieChart: function() {
            const canvas = document.getElementById('category-pie-chart');
            if (!canvas) return;
            
            const data = this.getData();
            if (!data) return;
            
            const ctx = canvas.getContext('2d');
            
            const colors = {
                'Entertainment': '#818cf8',
                'Work': '#fbbf24',
                'Utility': '#fb7185',
                'Personal': '#34d399'
            };
            
            const categories = Object.keys(data.categories);
            const values = Object.values(data.categories);
            
            this.charts.categoryPie = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categories,
                    datasets: [{
                        data: values,
                        backgroundColor: categories.map(cat => colors[cat] || '#6366f1'),
                        borderWidth: 2,
                        borderColor: '#111827'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#9ca3af',
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            padding: 12,
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        },
        
        /**
         * Create top subscriptions bar chart
         */
        createTopSubscriptionsChart: function() {
            const canvas = document.getElementById('top-subs-chart');
            if (!canvas) return;
            
            const data = this.getData();
            if (!data || data.topSubscriptions.length === 0) return;
            
            const ctx = canvas.getContext('2d');
            
            this.charts.topSubs = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.topSubscriptions.map(sub => sub.serviceName),
                    datasets: [{
                        label: 'Monthly Cost',
                        data: data.topSubscriptions.map(sub => {
                            return sub.billingCycle === 'Monthly' ? sub.price :
                                   sub.billingCycle === 'Yearly' ? sub.price / 12 :
                                   sub.billingCycle === 'Weekly' ? sub.price * 4 : sub.price;
                        }),
                        backgroundColor: [
                            'rgba(99, 102, 241, 0.8)',
                            'rgba(251, 191, 36, 0.8)',
                            'rgba(251, 113, 133, 0.8)',
                            'rgba(52, 211, 153, 0.8)',
                            'rgba(147, 51, 234, 0.8)'
                        ],
                        borderWidth: 0,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            padding: 12,
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    return '$' + context.parsed.x.toFixed(2) + '/month';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#9ca3af',
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#9ca3af'
                            }
                        }
                    }
                }
            });
        },
        
        /**
         * Export chart as image
         */
        exportChart: function(chartId) {
            const chart = this.charts[chartId];
            if (!chart) return;
            
            const canvas = chart.canvas;
            const url = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.download = `${chartId}-${Date.now()}.png`;
            link.href = url;
            link.click();
            
            window.SubscriptionUI?.showNotification('Chart exported successfully', 'success');
        }
    };
    
    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
        Analytics.init();
    });
    
    // Export to window
    window.Analytics = Analytics;
    
})(window);
