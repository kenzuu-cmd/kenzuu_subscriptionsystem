using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace ASIGNAR_SubscriptionSystem.Pages.Api
{
    /// <summary>
    /// API endpoint for fetching notifications from database
    /// Returns JSON data for real-time notification updates
    /// </summary>
    public class NotificationsModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<NotificationsModel> _logger;

        public NotificationsModel(SubscriptionContext context, ILogger<NotificationsModel> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// GET: /Api/Notifications - Fetch all unread and recent notifications
        /// </summary>
        public async Task<IActionResult> OnGetAsync()
        {
            try
            {
                // Security: Add rate limiting in production
                // Security: Add user authentication/authorization when implemented

                if (!await _context.Database.CanConnectAsync())
                {
                    return new JsonResult(new
                    {
                        success = false,
                        error = "Database not available",
                        notifications = Array.Empty<object>(),
                        unreadCount = 0
                    })
                    {
                        StatusCode = 503
                    };
                }

                // Fetch unread notifications and recent read notifications (last 7 days)
                var cutoffDate = DateTime.UtcNow.AddDays(-7);
                var notifications = await _context.Notifications
                    .Include(n => n.Subscription)
                    .Where(n => !n.IsRead || n.CreatedAt > cutoffDate)
                    .OrderByDescending(n => n.Priority == "high" ? 0 : n.Priority == "medium" ? 1 : 2)
                    .ThenByDescending(n => n.CreatedAt)
                    .Take(50)
                    .Select(n => new
                    {
                        id = n.Id,
                        type = n.Type,
                        title = n.Title,
                        message = n.Message,
                        icon = n.Icon,
                        priority = n.Priority,
                        subscriptionId = n.SubscriptionId,
                        subscriptionName = n.Subscription != null ? n.Subscription.ServiceName : null,
                        isRead = n.IsRead,
                        createdAt = n.CreatedAt,
                        timeAgo = n.TimeAgo
                    })
                    .ToListAsync();

                var unreadCount = notifications.Count(n => !n.isRead);

                _logger.LogInformation($"API: Returning {notifications.Count} notifications ({unreadCount} unread)");

                // Security: Set appropriate cache headers
                Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
                Response.Headers["Pragma"] = "no-cache";
                Response.Headers["X-Content-Type-Options"] = "nosniff";

                return new JsonResult(new
                {
                    success = true,
                    notifications,
                    unreadCount,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching notifications");
                return new JsonResult(new
                {
                    success = false,
                    error = "An error occurred while fetching notifications",
                    notifications = Array.Empty<object>(),
                    unreadCount = 0
                })
                {
                    StatusCode = 500
                };
            }
        }

        /// <summary>
        /// POST: /Api/Notifications?handler=MarkRead - Mark notification as read
        /// </summary>
        public async Task<IActionResult> OnPostMarkReadAsync([FromBody] MarkReadRequest request)
        {
            try
            {
                if (request?.Id == null)
                {
                    return BadRequest(new { success = false, error = "Invalid request" });
                }

                var notification = await _context.Notifications.FindAsync(request.Id);
                if (notification == null)
                {
                    return NotFound(new { success = false, error = "Notification not found" });
                }

                if (!notification.IsRead)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return new JsonResult(new { success = true, id = notification.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                return new JsonResult(new { success = false, error = "Server error" })
                {
                    StatusCode = 500
                };
            }
        }

        /// <summary>
        /// POST: /Api/Notifications?handler=MarkAllRead - Mark all as read
        /// </summary>
        public async Task<IActionResult> OnPostMarkAllReadAsync()
        {
            try
            {
                var unreadNotifications = await _context.Notifications
                    .Where(n => !n.IsRead)
                    .ToListAsync();

                foreach (var notification in unreadNotifications)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return new JsonResult(new { success = true, count = unreadNotifications.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return new JsonResult(new { success = false, error = "Server error" })
                {
                    StatusCode = 500
                };
            }
        }

        /// <summary>
        /// DELETE: /Api/Notifications - Delete notification by ID
        /// </summary>
        public async Task<IActionResult> OnDeleteAsync(int id)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(id);
                if (notification == null)
                {
                    return NotFound(new { success = false, error = "Notification not found" });
                }

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                return new JsonResult(new { success = true, id = notification.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                return new JsonResult(new { success = false, error = "Server error" })
                {
                    StatusCode = 500
                };
            }
        }

        /// <summary>
        /// POST: /Api/Notifications?handler=ClearAll - Clear all notifications
        /// </summary>
        public async Task<IActionResult> OnPostClearAllAsync()
        {
            try
            {
                var allNotifications = await _context.Notifications.ToListAsync();
                _context.Notifications.RemoveRange(allNotifications);
                await _context.SaveChangesAsync();

                return new JsonResult(new { success = true, count = allNotifications.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing all notifications");
                return new JsonResult(new { success = false, error = "Server error" })
                {
                    StatusCode = 500
                };
            }
        }

        // Request models
        public class MarkReadRequest
        {
            public int Id { get; set; }
        }
    }
}
