using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    public class DeveloperOptionsModel : PageModel
    {
        public IActionResult OnGet()
        {
            // Check if user is admin
            if (HttpContext.Session.GetString("IsAdmin") != "true")
            {
                return RedirectToPage("/Home");
            }

            return Page();
        }
    }
}
