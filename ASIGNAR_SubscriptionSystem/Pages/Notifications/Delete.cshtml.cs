using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;

namespace ASIGNAR_SubscriptionSystem.Pages.Notifications
{
    public class DeleteModel : PageModel
    {
        private readonly SubscriptionContext _context;

        public DeleteModel(SubscriptionContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Notification Notification { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var notification = await _context.Notifications
                .Include(n => n.Subscription)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (notification == null)
            {
                return NotFound();
            }
            
            Notification = notification;
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var notification = await _context.Notifications.FindAsync(id);
            if (notification != null)
            {
                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
