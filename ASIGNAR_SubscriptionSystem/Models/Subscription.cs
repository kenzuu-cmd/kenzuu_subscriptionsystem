using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SubscriptionSystem.Models
{
    public class Subscription
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Service name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Service name must be between 2 and 100 characters")]
        [Display(Name = "Service Name")]
        public string ServiceName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, 999999.99, ErrorMessage = "Amount must be between 0.01 and 999,999.99")]
        [Column(TypeName = "decimal(18, 2)")]
        [Display(Name = "Amount")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Billing cycle is required")]
        [Display(Name = "Billing Cycle")]
        public string BillingCycle { get; set; } = "Monthly";

        [Required(ErrorMessage = "Next payment date is required")]
        [DataType(DataType.Date)]
        [Display(Name = "Next Payment Date")]
        public DateTime NextPaymentDate { get; set; }

        [Required(ErrorMessage = "Category is required")]
        [Display(Name = "Category")]
        public string Category { get; set; } = "Entertainment";
    }
}