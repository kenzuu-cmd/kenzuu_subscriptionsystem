using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// CHANGE "WebApplication1" TO YOUR ACTUAL PROJECT NAME
namespace SubscriptionSystem.Models
{
    public class Subscription
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ServiceName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }

        public string BillingCycle { get; set; } = "Monthly";
        public DateTime NextPaymentDate { get; set; }
        public string Category { get; set; } = "Entertainment";
    }
}