using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SubscriptionSystem.Models;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    public class AddSubscriptionModel : PageModel
    {
        [BindProperty]
        public Subscription Subscription { get; set; } = new();

        public void OnGet()
        {
            // Set default date to today for convenience
            Subscription.NextPaymentDate = DateTime.Today;
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            // TODO: Later, this is where we save to SQL Server
            // _context.Subscriptions.Add(Subscription);
            // _context.SaveChanges();

            return RedirectToPage("./Index");
        }
    }
}