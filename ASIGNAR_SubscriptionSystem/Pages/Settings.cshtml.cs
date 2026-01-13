using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Identity;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    [Authorize]
    public class SettingsModel : PageModel
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ILogger<SettingsModel> _logger;

        public SettingsModel(UserManager<IdentityUser> userManager, ILogger<SettingsModel> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        [BindProperty]
        public string Username { get; set; } = string.Empty;

        [BindProperty]
        public string Email { get; set; } = string.Empty;

        public bool EmailConfirmed { get; set; }

        [BindProperty]
        public bool EmailNotifications { get; set; } = true;

        public async Task OnGetAsync()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user != null)
                {
                    Username = await _userManager.GetUserNameAsync(user) ?? string.Empty;
                    Email = await _userManager.GetEmailAsync(user) ?? string.Empty;
                    EmailConfirmed = await _userManager.IsEmailConfirmedAsync(user);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error loading settings for user {UserId}", _userManager.GetUserId(User));
                TempData["StatusMessage"] = "Error: The service is temporarily unavailable due to database connectivity. Please try again later.";
            }
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return NotFound();
                }

                // Update email if changed
                if (Email != user.Email)
                {
                    var setEmailResult = await _userManager.SetEmailAsync(user, Email);
                    if (!setEmailResult.Succeeded)
                    {
                        foreach (var error in setEmailResult.Errors)
                        {
                            ModelState.AddModelError(string.Empty, error.Description);
                        }
                        return Page();
                    }
                }

                TempData["StatusMessage"] = "Your profile has been updated";
                return RedirectToPage();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error updating settings for user {UserId}", _userManager.GetUserId(User));
                TempData["StatusMessage"] = "Error: The service is temporarily unavailable due to database connectivity. Please try again later.";
                return Page();
            }
        }
    }
}