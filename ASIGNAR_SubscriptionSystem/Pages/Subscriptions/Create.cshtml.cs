using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;
using Microsoft.AspNetCore.Authorization;

namespace ASIGNAR_SubscriptionSystem.Pages.Subscriptions
{
    [Authorize]
    public class CreateModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<CreateModel> _logger;

        public CreateModel(SubscriptionContext context, ILogger<CreateModel> logger)
        {
            _context = context;
            _logger = logger;
        }

        [BindProperty]
        public Subscription Subscription { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync()
        {
            try
            {
                // Check database connectivity
                if (!await _context.Database.CanConnectAsync())
                {
                    _logger.LogWarning("Create Subscription: Database connection failed");
                    return RedirectToPage("/DatabaseUnavailable", new { returnUrl = "/Subscriptions/Create" });
                }

                // Initialize empty subscription
                Subscription = new Subscription();
                return Page();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading Create Subscription page");
                return RedirectToPage("/DatabaseUnavailable", new { returnUrl = "/Subscriptions/Create" });
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
                _context.Subscriptions.Add(Subscription);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Subscription created successfully: {ServiceName}", Subscription.ServiceName);
                return RedirectToPage("./Index");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription");
                ModelState.AddModelError(string.Empty, "Database unavailable. Please try again later.");
                return Page();
            }
        }
    }
}
