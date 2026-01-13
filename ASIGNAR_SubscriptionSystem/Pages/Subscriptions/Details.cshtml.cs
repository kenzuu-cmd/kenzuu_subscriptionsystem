using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.AspNetCore.Authorization;

namespace ASIGNAR_SubscriptionSystem.Pages.Subscriptions
{
    [Authorize]
    public class DetailsModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<DetailsModel> _logger;

        public DetailsModel(SubscriptionContext context, ILogger<DetailsModel> logger)
        {
            _context = context;
            _logger = logger;
        }

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
                    _logger.LogWarning("Details Subscription: Database connection failed");
                    return RedirectToPage("/DatabaseUnavailable", new { returnUrl = $"/Subscriptions/Details?id={id}" });
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
                _logger.LogError(ex, "Error loading subscription details: {Id}", id);
                return RedirectToPage("/DatabaseUnavailable", new { returnUrl = $"/Subscriptions/Details?id={id}" });
            }
        }
    }
}
