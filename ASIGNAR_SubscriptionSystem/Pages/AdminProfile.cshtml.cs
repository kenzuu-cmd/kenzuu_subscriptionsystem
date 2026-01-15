using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    public class AdminProfileModel : PageModel
    {
        [BindProperty]
        public AdminProfileData ProfileData { get; set; } = new AdminProfileData();

        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }

        public IActionResult OnGet()
        {
            // Check if user is admin
            if (HttpContext.Session.GetString("IsAdmin") != "true")
            {
                return RedirectToPage("/Home");
            }

            // Load existing admin profile data from session or defaults
            ProfileData.Username = HttpContext.Session.GetString("AdminUsername") ?? "Admin";
            ProfileData.Email = HttpContext.Session.GetString("AdminEmail") ?? "";
            ProfileData.FirstName = HttpContext.Session.GetString("AdminFirstName") ?? "";
            ProfileData.LastName = HttpContext.Session.GetString("AdminLastName") ?? "";

            return Page();
        }

        public IActionResult OnPost()
        {
            // Check if user is admin
            if (HttpContext.Session.GetString("IsAdmin") != "true")
            {
                return RedirectToPage("/Home");
            }

            if (!ModelState.IsValid)
            {
                ErrorMessage = "Please correct the errors and try again.";
                return Page();
            }

            // If password change is requested, validate current password
            if (!string.IsNullOrEmpty(ProfileData.CurrentPassword) || !string.IsNullOrEmpty(ProfileData.NewPassword))
            {
                if (ProfileData.CurrentPassword != "Admin123")
                {
                    ErrorMessage = "Current password is incorrect.";
                    return Page();
                }

                if (string.IsNullOrEmpty(ProfileData.NewPassword) || ProfileData.NewPassword.Length < 6)
                {
                    ErrorMessage = "New password must be at least 6 characters long.";
                    return Page();
                }

                // In a real application, update password in database
                // For now, just show success message
            }

            // Save profile data to session (in real app, save to database)
            HttpContext.Session.SetString("AdminEmail", ProfileData.Email ?? "");
            HttpContext.Session.SetString("AdminFirstName", ProfileData.FirstName ?? "");
            HttpContext.Session.SetString("AdminLastName", ProfileData.LastName ?? "");

            SuccessMessage = "Profile updated successfully!";
            return Page();
        }
    }

    public class AdminProfileData
    {
        public string Username { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Please enter a valid email address")]
        public string? Email { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }

        [DataType(DataType.Password)]
        public string? CurrentPassword { get; set; }

        [DataType(DataType.Password)]
        public string? NewPassword { get; set; }
    }
}
