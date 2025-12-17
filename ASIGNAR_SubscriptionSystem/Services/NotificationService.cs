using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;

namespace ASIGNAR_SubscriptionSystem.Services
{
    /// <summary>
    /// Background service to automatically generate payment notifications
    /// Runs every hour to check for upcoming payments and create alerts
    /// </summary>
    public class NotificationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IServiceScopeFactory scopeFactory,
            ILogger<NotificationService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("NotificationService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await GeneratePaymentNotifications();
                    await CleanupOldNotifications();
                    
                    // Run every hour
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in NotificationService");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }
        }

        /// <summary>
        /// Generate notifications for upcoming and overdue payments
        /// </summary>
        private async Task GeneratePaymentNotifications()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SubscriptionContext>();

            try
            {
                if (!await context.Database.CanConnectAsync())
                {
                    _logger.LogWarning("Database not available for notification generation");
                    return;
                }

                var subscriptions = await context.Subscriptions.ToListAsync();
                var today = DateTime.Today;
                var notificationsToAdd = new List<Notification>();

                foreach (var subscription in subscriptions)
                {
                    var paymentDate = subscription.NextPaymentDate.Date;
                    var daysUntil = (paymentDate - today).Days;

                    // Check if notification already exists for this subscription and timeframe
                    var existingNotification = await context.Notifications
                        .Where(n => n.SubscriptionId == subscription.Id 
                                 && n.CreatedAt > DateTime.UtcNow.AddHours(-23))
                        .FirstOrDefaultAsync();

                    if (existingNotification != null)
                        continue; // Skip if we already notified recently

                    Notification? notification = null;

                    // Payment overdue - Highest priority
                    if (daysUntil < 0)
                    {
                        notification = new Notification
                        {
                            Type = "error",
                            Icon = "bi-exclamation-circle-fill",
                            Title = "Payment Overdue",
                            Message = $"{subscription.ServiceName} payment is overdue! Due date was {subscription.NextPaymentDate:MMM dd}",
                            SubscriptionId = subscription.Id,
                            Priority = "high",
                            IsRead = false
                        };
                    }
                    // Payment due today
                    else if (daysUntil == 0)
                    {
                        notification = new Notification
                        {
                            Type = "error",
                            Icon = "bi-calendar-x",
                            Title = "Payment Due Today",
                            Message = $"{subscription.ServiceName} payment of ?{subscription.Price:N2} is due today",
                            SubscriptionId = subscription.Id,
                            Priority = "high",
                            IsRead = false
                        };
                    }
                    // Payment due tomorrow
                    else if (daysUntil == 1)
                    {
                        notification = new Notification
                        {
                            Type = "warning",
                            Icon = "bi-calendar-event",
                            Title = "Payment Tomorrow",
                            Message = $"{subscription.ServiceName} payment of ?{subscription.Price:N2} due tomorrow",
                            SubscriptionId = subscription.Id,
                            Priority = "high",
                            IsRead = false
                        };
                    }
                    // Payment due in 3 days
                    else if (daysUntil == 3)
                    {
                        notification = new Notification
                        {
                            Type = "warning",
                            Icon = "bi-bell",
                            Title = "Payment Coming Soon",
                            Message = $"{subscription.ServiceName} payment of ?{subscription.Price:N2} due in 3 days",
                            SubscriptionId = subscription.Id,
                            Priority = "medium",
                            IsRead = false
                        };
                    }
                    // Payment due in 7 days
                    else if (daysUntil == 7)
                    {
                        notification = new Notification
                        {
                            Type = "info",
                            Icon = "bi-clock-history",
                            Title = "Payment Next Week",
                            Message = $"{subscription.ServiceName} payment of ?{subscription.Price:N2} due in 1 week",
                            SubscriptionId = subscription.Id,
                            Priority = "low",
                            IsRead = false
                        };
                    }

                    if (notification != null)
                    {
                        notificationsToAdd.Add(notification);
                    }
                }

                if (notificationsToAdd.Any())
                {
                    await context.Notifications.AddRangeAsync(notificationsToAdd);
                    await context.SaveChangesAsync();
                    _logger.LogInformation($"Generated {notificationsToAdd.Count} new notifications");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating payment notifications");
            }
        }

        /// <summary>
        /// Cleanup notifications older than 30 days
        /// </summary>
        private async Task CleanupOldNotifications()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SubscriptionContext>();

            try
            {
                if (!await context.Database.CanConnectAsync())
                    return;

                var cutoffDate = DateTime.UtcNow.AddDays(-30);
                var oldNotifications = await context.Notifications
                    .Where(n => n.CreatedAt < cutoffDate && n.IsRead)
                    .ToListAsync();

                if (oldNotifications.Any())
                {
                    context.Notifications.RemoveRange(oldNotifications);
                    await context.SaveChangesAsync();
                    _logger.LogInformation($"Cleaned up {oldNotifications.Count} old notifications");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old notifications");
            }
        }
    }
}
