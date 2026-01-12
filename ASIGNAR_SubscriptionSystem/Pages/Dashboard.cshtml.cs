using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.AspNetCore.Authorization;

namespace SubscriptionSystem.Pages
{
    /// <summary>
    /// Dashboard page - Analytics overview and quick insights
    /// </summary>
    [Authorize]
    public class DashboardModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<DashboardModel> _logger;

        public DashboardModel(SubscriptionContext context, ILogger<DashboardModel> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Summary metrics
        public decimal TotalMonthly { get; set; }
        public decimal YearlyProjected { get; set; }
        public int ActiveCount { get; set; }
        public int DueSoonCount { get; set; }

        // Top subscriptions for quick view
        public IList<Subscription> TopSubscriptions { get; set; } = new List<Subscription>();
        
        // Upcoming payments
        public IList<Subscription> UpcomingPayments { get; set; } = new List<Subscription>();
        
        // Database status
        public bool IsDatabaseAvailable { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;

        public async Task OnGetAsync()
        {
            try
            {
                // Check database connectivity
                if (!await _context.Database.CanConnectAsync())
                {
                    IsDatabaseAvailable = false;
                    ErrorMessage = "Database connection is not available. Please ensure your SQL Server is running and the connection string is configured correctly.";
                    _logger.LogWarning("Dashboard: Database connection failed");
                    return;
                }

                IsDatabaseAvailable = true;

                // Load all subscriptions from database
                var allSubscriptions = await _context.Subscriptions
                    .OrderBy(s => s.NextPaymentDate)
                    .ToListAsync();

                if (allSubscriptions.Count == 0)
                {
                    _logger.LogInformation("Dashboard: No subscriptions found in database");
                    return;
                }

                // Calculate metrics from live data
                var monthlySubscriptions = allSubscriptions.Where(x => x.BillingCycle == "Monthly");
                TotalMonthly = monthlySubscriptions.Sum(x => x.Price);

                var yearlySubscriptions = allSubscriptions.Where(x => x.BillingCycle == "Yearly");
                YearlyProjected = (TotalMonthly * 12) + yearlySubscriptions.Sum(x => x.Price);

                ActiveCount = allSubscriptions.Count;

                // Count subscriptions due in next 5 days
                DueSoonCount = allSubscriptions.Count(x =>
                    (x.NextPaymentDate - DateTime.Today).TotalDays >= 0 &&
                    (x.NextPaymentDate - DateTime.Today).TotalDays <= 5);

                // Get top 5 most expensive subscriptions
                TopSubscriptions = allSubscriptions
                    .OrderByDescending(s => s.Price)
                    .Take(5)
                    .ToList();

                // Get upcoming payments (next 7 days)
                UpcomingPayments = allSubscriptions
                    .Where(s => (s.NextPaymentDate - DateTime.Today).TotalDays >= 0 &&
                               (s.NextPaymentDate - DateTime.Today).TotalDays <= 7)
                    .OrderBy(s => s.NextPaymentDate)
                    .Take(5)
                    .ToList();

                _logger.LogInformation($"Dashboard loaded successfully with {allSubscriptions.Count} subscriptions");
            }
            catch (Exception ex)
            {
                IsDatabaseAvailable = false;
                ErrorMessage = "An error occurred while loading dashboard data. Please try again later.";
                _logger.LogError(ex, "Error loading Dashboard data");
            }
        }
    }
}
