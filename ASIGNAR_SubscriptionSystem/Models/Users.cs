using System.ComponentModel.DataAnnotations;

namespace ASIGNAR_SubscriptionSystem.Models
{
    public class Users
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be 3-50 characters")]
        [Display(Name = "Username")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        [StringLength(100)]
        [Display(Name = "Email Address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role is required")]
        [StringLength(20)]
        [Display(Name = "User Role")]
        public string Role { get; set; } = "Admin"; // Admin, User

        [Display(Name = "Account Created")]
        [DataType(DataType.DateTime)]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Display(Name = "Last Login")]
        [DataType(DataType.DateTime)]
        public DateTime? LastLogin { get; set; }
    }
}
