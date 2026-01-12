using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.AspNetCore.Authorization;

namespace ASIGNAR_SubscriptionSystem.Pages.Subscriptions
{
    [Authorize]
    public class CreateModel : PageModel
    {
        private readonly SubscriptionContext _context;

        public CreateModel(SubscriptionContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Subscription Subscription { get; set; } = default!;

        public IActionResult OnGet()
        {
            // Initialize empty subscription - let user fill all fields
            // This prevents confusion with pre-filled values
            Subscription = new Subscription();
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                // Return to page with validation errors
                // Client-side validation will highlight issues
                return Page();
            }

            _context.Subscriptions.Add(Subscription);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
