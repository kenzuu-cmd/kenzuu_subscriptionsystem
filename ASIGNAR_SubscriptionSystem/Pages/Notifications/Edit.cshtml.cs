using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;

namespace ASIGNAR_SubscriptionSystem.Pages.Notifications
{
    public class EditModel : PageModel
    {
        private readonly SubscriptionContext _context;

        public EditModel(SubscriptionContext context)
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

            var notification = await _context.Notifications.FirstOrDefaultAsync(m => m.Id == id);
            if (notification == null)
            {
                return NotFound();
            }
            
            Notification = notification;
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

            _context.Attach(Notification).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await NotificationExists(Notification.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return RedirectToPage("./Index");
        }

        private async Task<bool> NotificationExists(int id)
        {
            return await _context.Notifications.AnyAsync(e => e.Id == id);
        }
    }
}
