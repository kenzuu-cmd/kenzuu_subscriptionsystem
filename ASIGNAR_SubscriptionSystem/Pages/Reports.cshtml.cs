using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ASIGNAR_SubscriptionSystem.Data;
using SubscriptionSystem.Models;
using Microsoft.AspNetCore.Authorization;

namespace ASIGNAR_SubscriptionSystem.Pages;

/// <summary>
/// Reports and Analytics page - 100% Database-driven insights
/// </summary>
[Authorize]
public class ReportsModel : PageModel
{
    private readonly SubscriptionContext _context;
    private readonly ILogger<ReportsModel> _logger;

    public ReportsModel(SubscriptionContext context, ILogger<ReportsModel> logger)
    {
        _context = context;
        _logger = logger;
    }

    public IList<Subscription> AllSubscriptions { get; set; } = new List<Subscription>();
    public Dictionary<string, decimal> CategorySpending { get; set; } = new Dictionary<string, decimal>();
    public Dictionary<string, int> CategoryCounts { get; set; } = new Dictionary<string, int>();
    public IList<Subscription> TopSubscriptions { get; set; } = new List<Subscription>();
    public List<MonthlyTrend> MonthlyTrends { get; set; } = new List<MonthlyTrend>();
    
    public decimal TotalMonthlySpend { get; set; }
    public decimal TotalYearlySpend { get; set; }
    public int ActiveSubscriptionCount { get; set; }
    public decimal AverageMonthlyCost { get; set; }
    public decimal HighestSubscriptionCost { get; set; }
    public decimal LowestSubscriptionCost { get; set; }

    public async Task<IActionResult> OnGetAsync()
    {
        try
        {
            // Check database connectivity
            if (!await _context.Database.CanConnectAsync())
            {
                _logger.LogWarning("Reports page: Database connection failed");
                return RedirectToPage("/DatabaseUnavailable", new { returnUrl = "/Reports" });
            }

            AllSubscriptions = await _context.Subscriptions
                .OrderBy(s => s.NextPaymentDate)
                .ToListAsync();

            if (AllSubscriptions.Count == 0)
            {
                _logger.LogInformation("Reports page: No subscriptions found in database");
                return Page();
            }

            CategorySpending = AllSubscriptions
                .GroupBy(s => s.Category)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12)
                );

            CategoryCounts = AllSubscriptions
                .GroupBy(s => s.Category)
                .ToDictionary(g => g.Key, g => g.Count());

            TopSubscriptions = AllSubscriptions
                .OrderByDescending(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12)
                .Take(5)
                .ToList();

            var monthlySubscriptions = AllSubscriptions.Where(x => x.BillingCycle == "Monthly");
            var yearlySubscriptions = AllSubscriptions.Where(x => x.BillingCycle == "Yearly");
            
            TotalMonthlySpend = monthlySubscriptions.Sum(x => x.Price) + 
                               yearlySubscriptions.Sum(x => x.Price / 12);
            
            TotalYearlySpend = (monthlySubscriptions.Sum(x => x.Price) * 12) + 
                              yearlySubscriptions.Sum(x => x.Price);

            ActiveSubscriptionCount = AllSubscriptions.Count;
            
            if (ActiveSubscriptionCount > 0)
            {
                AverageMonthlyCost = TotalMonthlySpend / ActiveSubscriptionCount;
                
                var allMonthlyCosts = AllSubscriptions
                    .Select(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12)
                    .ToList();
                
                HighestSubscriptionCost = allMonthlyCosts.Max();
                LowestSubscriptionCost = allMonthlyCosts.Min();
            }

            CalculateMonthlyTrends();

            _logger.LogInformation($"Reports page loaded successfully with {AllSubscriptions.Count} subscriptions");
            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading Reports page data");
            return RedirectToPage("/DatabaseUnavailable", new { returnUrl = "/Reports" });
        }
    }

    private void CalculateMonthlyTrends()
    {
        MonthlyTrends = new List<MonthlyTrend>();
        
        for (int i = 5; i >= 0; i--)
        {
            var month = DateTime.Now.AddMonths(-i);
            var monthName = month.ToString("MMM yyyy");
            
            var activeInMonth = AllSubscriptions
                .Where(s => s.NextPaymentDate <= DateTime.Now && 
                           s.NextPaymentDate.AddMonths(-i) >= DateTime.Now.AddMonths(-(i + 1)))
                .ToList();
            
            var monthlySpend = activeInMonth
                .Sum(s => s.BillingCycle == "Monthly" ? s.Price : s.Price / 12);
            
            MonthlyTrends.Add(new MonthlyTrend
            {
                Month = monthName,
                MonthShort = month.ToString("MMM"),
                Amount = monthlySpend > 0 ? monthlySpend : TotalMonthlySpend,
                SubscriptionCount = activeInMonth.Count > 0 ? activeInMonth.Count : ActiveSubscriptionCount
            });
        }
    }

    public class MonthlyTrend
    {
        public string Month { get; set; } = string.Empty;
        public string MonthShort { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int SubscriptionCount { get; set; }
    }
}

