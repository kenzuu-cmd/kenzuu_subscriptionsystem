using Microsoft.AspNetCore.Identity.UI.Services;

namespace ASIGNAR_SubscriptionSystem.Services
{
    /// <summary>
    /// Development email sender for local development with LocalDB.
    /// Logs email attempts to console instead of sending real emails.
    /// Use a real implementation (SendGrid, SMTP, etc.) in production.
    /// </summary>
    public class DevEmailSender : IEmailSender
    {
        private readonly ILogger<DevEmailSender> _logger;

        public DevEmailSender(ILogger<DevEmailSender> logger)
        {
            _logger = logger;
        }

        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            _logger.LogInformation("=== EMAIL (Development Mode - Not Sent) ===");
            _logger.LogInformation("To: {Email}", email);
            _logger.LogInformation("Subject: {Subject}", subject);
            _logger.LogInformation("Message: {Message}", htmlMessage);
            _logger.LogInformation("==========================================");
            
            // In development, we just log and return success
            return Task.CompletedTask;
        }
    }
}
