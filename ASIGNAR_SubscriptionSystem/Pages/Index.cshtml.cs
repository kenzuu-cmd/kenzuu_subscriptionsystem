using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SubscriptionSystem.Pages
{
    /// <summary>
    /// Root index page - redirects to Dashboard (main entry point after Home)
    /// </summary>
    public class IndexModel : PageModel
    {
        public IActionResult OnGet()
        {
            // Redirect to Dashboard as the main app interface
            return RedirectToPage("/Dashboard");
        }
    }
}