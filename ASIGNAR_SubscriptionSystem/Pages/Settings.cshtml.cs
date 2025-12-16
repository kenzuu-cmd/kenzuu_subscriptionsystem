using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    public class SettingsModel : PageModel
    {
        [BindProperty]
        public string FullName { get; set; } = "ACT Student";

        [BindProperty]
        public string Email { get; set; } = "student@act.edu.ph";

        [BindProperty]
        public string Currency { get; set; } = "USD";

        [BindProperty]
        public bool EmailNotifications { get; set; } = true;

        public void OnGet()
        {
            // Data is already set by defaults above for the demo
        }

        public IActionResult OnPost()
        {
            // This is where we would save changes in the future
            // For now, just reload the page to show "saved" state
            return Page();
        }
    }
}