using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.AspNetCore.Authorization;

namespace ASIGNAR_SubscriptionSystem.Pages.Subscriptions
{
    /// <summary>
    /// Subscriptions Index - Complete list management with database integration
    /// </summary>
    [Authorize]
    public class IndexModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(SubscriptionContext context, ILogger<IndexModel> logger)
        {
            _context = context;
            _logger = logger;
        }

        public IList<Subscription> Subscriptions { get; set; } = new List<Subscription>();
        public decimal TotalMonthly { get; set; }
        public decimal YearlyProjected { get; set; }
        public int DueSoonCount { get; set; }
        public int ActiveCount { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            try
            {
                // Check database connectivity
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogWarning("Subscriptions Index: Database connection failed");
                    return RedirectToPage("/DatabaseUnavailable", new { returnUrl = "/Subscriptions/Index" });
                }

                Subscriptions = await _context.Subscriptions
                    .OrderBy(s => s.NextPaymentDate)
                    .ToListAsync();

                if (Subscriptions.Count == 0)
                {
                    _logger.LogInformation("Subscriptions Index: No subscriptions found in database");
                    return Page();
                }

                var monthlySubscriptions = Subscriptions.Where(x => x.BillingCycle == "Monthly");
                TotalMonthly = monthlySubscriptions.Sum(x => x.Price);

                var yearlySubscriptions = Subscriptions.Where(x => x.BillingCycle == "Yearly");
                YearlyProjected = (TotalMonthly * 12) + yearlySubscriptions.Sum(x => x.Price);

                DueSoonCount = Subscriptions.Count(x => 
                    (x.NextPaymentDate - DateTime.Today).TotalDays >= 0 && 
                    (x.NextPaymentDate - DateTime.Today).TotalDays <= 5);

                ActiveCount = Subscriptions.Count;

                _logger.LogInformation($"Subscriptions Index loaded successfully with {Subscriptions.Count} subscriptions");
                return Page();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading Subscriptions Index data");
                return RedirectToPage("/DatabaseUnavailable", new { returnUrl = "/Subscriptions/Index" });
            }
        }
    }
}
