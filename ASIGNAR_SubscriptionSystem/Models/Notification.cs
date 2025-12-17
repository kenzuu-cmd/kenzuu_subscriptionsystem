using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SubscriptionSystem.Models
{
    /// <summary>
    /// Database model for user notifications
    /// Tracks payment reminders, overdue alerts, and system messages
    /// </summary>
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Type { get; set; } = "info"; // error, warning, success, info

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Icon { get; set; } = "bi-bell-fill";

        [MaxLength(50)]
        public string Priority { get; set; } = "medium"; // high, medium, low

        public int? SubscriptionId { get; set; }

        [ForeignKey(nameof(SubscriptionId))]
        public Subscription? Subscription { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadAt { get; set; }

        /// <summary>
        /// Computed property: Days since notification was created
        /// </summary>
        [NotMapped]
        public int DaysOld => (DateTime.UtcNow - CreatedAt).Days;

        /// <summary>
        /// Computed property: Time ago display string
        /// </summary>
        [NotMapped]
        public string TimeAgo
        {
            get
            {
                var span = DateTime.UtcNow - CreatedAt;
                if (span.TotalSeconds < 60) return "Just now";
                if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m ago";
                if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
                if (span.TotalDays < 7) return $"{(int)span.TotalDays}d ago";
                return CreatedAt.ToLocalTime().ToString("MMM dd, yyyy");
            }
        }
    }
}
