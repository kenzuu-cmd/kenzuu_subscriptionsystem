using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.AspNetCore.Authorization;

namespace ASIGNAR_SubscriptionSystem.Pages.Subscriptions
{
    [Authorize]
    public class EditModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<EditModel> _logger;

        public EditModel(SubscriptionContext context, ILogger<EditModel> logger)
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
                    _logger.LogWarning("Edit Subscription: Database connection failed");
                    return RedirectToPage("/DatabaseUnavailable", new { returnUrl = $"/Subscriptions/Edit?id={id}" });
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
                _logger.LogError(ex, "Error loading subscription for edit: {Id}", id);
                return RedirectToPage("/DatabaseUnavailable", new { returnUrl = $"/Subscriptions/Edit?id={id}" });
            }
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                _context.Attach(Subscription).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Subscription updated successfully: {Id}", Subscription.Id);
                return RedirectToPage("./Index");
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!await SubscriptionExistsAsync(Subscription.Id))
                {
                    _logger.LogWarning("Subscription not found during update: {Id}", Subscription.Id);
                    return NotFound();
                }
                else
                {
                    _logger.LogError(ex, "Concurrency error updating subscription: {Id}", Subscription.Id);
                    ModelState.AddModelError(string.Empty, "Database unavailable. Please try again later.");
                    return Page();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription: {Id}", Subscription.Id);
                ModelState.AddModelError(string.Empty, "Database unavailable. Please try again later.");
                return Page();
            }
        }

        private async Task<bool> SubscriptionExistsAsync(int id)
        {
            try
            {
                return await _context.Subscriptions.AnyAsync(e => e.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if subscription exists: {Id}", id);
                return false;
            }
        }
    }
}
