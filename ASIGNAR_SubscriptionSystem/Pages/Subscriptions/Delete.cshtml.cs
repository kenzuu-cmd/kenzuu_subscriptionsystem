using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.AspNetCore.Authorization;

namespace ASIGNAR_SubscriptionSystem.Pages.Subscriptions
{
    [Authorize]
    public class DeleteModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<DeleteModel> _logger;

        public DeleteModel(SubscriptionContext context, ILogger<DeleteModel> logger)
        {
            _context = context;
            _logger = logger;
        }

        [BindProperty]
        public Subscription Subscription { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            try
            {
                // Check database connectivity
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogWarning("Delete Subscription: Database connection failed");
                    return RedirectToPage("/DatabaseUnavailable", new { returnUrl = $"/Subscriptions/Delete?id={id}" });
                }

                var subscription = await _context.Subscriptions.FirstOrDefaultAsync(m => m.Id == id);

                if (subscription == null)
                {
                    return NotFound();
                }
                
                Subscription = subscription;
                return Page();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading subscription for delete: {Id}", id);
                return RedirectToPage("/DatabaseUnavailable", new { returnUrl = $"/Subscriptions/Delete?id={id}" });
            }
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            try
            {
                var subscription = await _context.Subscriptions.FindAsync(id);
                if (subscription != null)
                {
                    Subscription = subscription;
                    _context.Subscriptions.Remove(Subscription);
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("Subscription deleted successfully: {Id}", id);
                }

                return RedirectToPage("./Index");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting subscription: {Id}", id);
                ModelState.AddModelError(string.Empty, "Database unavailable. Please try again later.");
                return Page();
            }
        }
    }
}
