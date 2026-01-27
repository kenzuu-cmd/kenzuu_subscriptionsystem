using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ASIGNAR_SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    public class AdminLoginModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<AdminLoginModel> _logger;

        public AdminLoginModel(SubscriptionContext context, ILogger<AdminLoginModel> logger)
        {
            _context = context;
            _logger = logger;
        }

        [BindProperty]
        public Users AdminUser { get; set; } = new Users();

        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            // If already logged in as admin, redirect to home
            if (HttpContext.Session.GetString("IsAdmin") == "true")
            {
                return RedirectToPage("/Home");
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            // Only validate Username and Password for login
            ModelState.Remove("AdminUser.Email");
            ModelState.Remove("AdminUser.Role");
            
            if (string.IsNullOrEmpty(AdminUser.Username) || string.IsNullOrEmpty(AdminUser.Password))
            {
                ErrorMessage = "Please enter both username and password.";
                return Page();
            }

            try
            {
                // Database authentication
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == AdminUser.Username && u.Password == AdminUser.Password);

                if (user != null && user.Role == "Admin")
                {
                    // Update last login
                    user.LastLogin = DateTime.Now;
                    await _context.SaveChangesAsync();

                    // Set admin session
                    HttpContext.Session.SetString("IsAdmin", "true");
                    HttpContext.Session.SetString("AdminUsername", user.Username);
                    HttpContext.Session.SetString("AdminEmail", user.Email);

                    _logger.LogInformation("Admin logged in successfully: {Username}", user.Username);
                    return RedirectToPage("/Home");
                }

                ErrorMessage = "Invalid username or password.";
                _logger.LogWarning("Failed login attempt for username: {Username}", AdminUser.Username);
                return Page();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error during admin login");
                ErrorMessage = "Database connection error. Please try again later.";
                return Page();
            }
        }
    }
}
