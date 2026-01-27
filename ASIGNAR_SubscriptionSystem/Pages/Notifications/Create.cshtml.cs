using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;

namespace ASIGNAR_SubscriptionSystem.Pages.Notifications
{
    public class CreateModel : PageModel
    {
        private readonly SubscriptionContext _context;

        public CreateModel(SubscriptionContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Notification Notification { get; set; } = default!;

        public IActionResult OnGet()
        {
            ViewData["SubscriptionId"] = new SelectList(_context.Subscriptions, "Id", "ServiceName");
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                ViewData["SubscriptionId"] = new SelectList(_context.Subscriptions, "Id", "ServiceName");
                return Page();
            }

            _context.Notifications.Add(Notification);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
