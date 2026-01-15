using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ASIGNAR_SubscriptionSystem.Models;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    public class AdminLoginModel : PageModel
    {
        [BindProperty]
        public Users AdminUser { get; set; } = new Users();

        public string? ErrorMessage { get; set; }

        public void OnGet()
        {
            // If already logged in as admin, redirect to home
            if (HttpContext.Session.GetString("IsAdmin") == "true")
            {
                Response.Redirect("/Home");
            }
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                ErrorMessage = "Please enter both username and password.";
                return Page();
            }

            // Hardcoded admin credential check
            if (AdminUser.Username == "Admin" && AdminUser.Password == "Admin123")
            {
                // Set admin session
                HttpContext.Session.SetString("IsAdmin", "true");
                HttpContext.Session.SetString("AdminUsername", AdminUser.Username);
                return RedirectToPage("/Home");
            }

            ErrorMessage = "Invalid username or password.";
            return Page();
        }
    }
}
