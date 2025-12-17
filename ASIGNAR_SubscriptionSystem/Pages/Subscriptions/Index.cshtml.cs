using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;

namespace ASIGNAR_SubscriptionSystem.Pages.Subscriptions
{
    /// <summary>
    /// Subscriptions Index - Complete list management with database integration
    /// Handles database unavailability gracefully without blocking page load
    /// </summary>
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
        
        public bool IsDatabaseAvailable { get; set; } = true;
        public string ErrorMessage { get; set; } = string.Empty;

        public async Task OnGetAsync()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                
                if (!canConnect)
                {
                    IsDatabaseAvailable = false;
                    ErrorMessage = "Database connection is not available. Please ensure your SQL Server is running and the connection string is configured correctly.";
                    _logger.LogWarning("Subscriptions Index: Database connection failed");
                    return;
                }

                IsDatabaseAvailable = true;

                Subscriptions = await _context.Subscriptions
                    .OrderBy(s => s.NextPaymentDate)
                    .ToListAsync();

                if (Subscriptions.Count == 0)
                {
                    _logger.LogInformation("Subscriptions Index: No subscriptions found in database");
                    return;
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
            }
            catch (Exception ex)
            {
                IsDatabaseAvailable = false;
                ErrorMessage = "An error occurred while loading subscription data. Please try again later.";
                _logger.LogError(ex, "Error loading Subscriptions Index data");
            }
        }
    }
}
