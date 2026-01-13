using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ASIGNAR_SubscriptionSystem.Data;

namespace ASIGNAR_SubscriptionSystem.Pages
{
    public class DatabaseUnavailableModel : PageModel
    {
        private readonly SubscriptionContext _context;
        private readonly ILogger<DatabaseUnavailableModel> _logger;
        private readonly IConfiguration _configuration;

        public DatabaseUnavailableModel(
            SubscriptionContext context,
            ILogger<DatabaseUnavailableModel> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public string ErrorDetails { get; set; } = "Database unavailable. Please try again later.";
        public string TechnicalMessage { get; set; } = string.Empty;
        public bool ShowTechnicalDetails { get; set; } = false;
        public bool EnableAutoRetry { get; set; } = false;

        public void OnGet(string? returnUrl = null)
        {
            // Store return URL for redirect after successful retry
            ViewData["ReturnUrl"] = returnUrl ?? "/Dashboard";

            // Show technical details only in Development environment
            ShowTechnicalDetails = _configuration.GetValue<bool>("DetailedErrors", false);
            
            _logger.LogWarning("Database Unavailable page accessed. ReturnUrl: {ReturnUrl}", returnUrl);
        }

        public async Task<IActionResult> OnPostRetryConnectionAsync(string? returnUrl = null)
        {
            try
            {
                _logger.LogInformation("Attempting to retry database connection...");

                // Test database connectivity
                var canConnect = await _context.Database.CanConnectAsync();

                if (!canConnect)
                {
                    _logger.LogWarning("Database retry failed - cannot connect");
                    ErrorDetails = "Still unable to connect to the database. Please check that SQL Server is running.";
                    TechnicalMessage = "Database.CanConnectAsync() returned false";
                    ShowTechnicalDetails = _configuration.GetValue<bool>("DetailedErrors", false);
                    return Page();
                }

                // Check if database has pending migrations
                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
                if (pendingMigrations.Any())
                {
                    _logger.LogWarning("Database has pending migrations: {Migrations}", 
                        string.Join(", ", pendingMigrations));
                    ErrorDetails = "Database connection established, but migrations are pending. Please contact your administrator.";
                    TechnicalMessage = $"Pending migrations: {string.Join(", ", pendingMigrations)}";
                    ShowTechnicalDetails = _configuration.GetValue<bool>("DetailedErrors", false);
                    return Page();
                }

                // Success - redirect to original page or Dashboard
                _logger.LogInformation("Database connection retry successful");
                
                var redirectUrl = returnUrl ?? "/Dashboard";
                return RedirectToPage(redirectUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database connection retry");
                ErrorDetails = "An error occurred while attempting to connect to the database.";
                TechnicalMessage = ex.Message;
                ShowTechnicalDetails = _configuration.GetValue<bool>("DetailedErrors", false);
                return Page();
            }
        }
    }
}
