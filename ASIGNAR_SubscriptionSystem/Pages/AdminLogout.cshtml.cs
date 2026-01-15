using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    public class AdminLogoutModel : PageModel
    {
        public IActionResult OnGet()
        {
            // Clear admin session
            HttpContext.Session.Remove("IsAdmin");
            HttpContext.Session.Remove("AdminUsername");
            HttpContext.Session.Remove("AdminEmail");
            HttpContext.Session.Remove("AdminFirstName");
            HttpContext.Session.Remove("AdminLastName");
            HttpContext.Session.Clear();

            return RedirectToPage("/Home");
        }
    }
}
