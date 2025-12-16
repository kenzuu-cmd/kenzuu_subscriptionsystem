using Microsoft.AspNetCore.Mvc.RazorPages;
using SubscriptionSystem.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SubscriptionSystem.Pages
{
    /// <summary>
    /// Dashboard page - Main application interface for managing subscriptions
    /// </summary>
    public class DashboardModel : PageModel
    {
        // Data properties for the dashboard view
        public List<Subscription> Subscriptions { get; set; } = new List<Subscription>();
        public decimal TotalMonthly { get; set; }
        public decimal YearlyProjected { get; set; }
        public int DueSoonCount { get; set; }

        /// <summary>
        /// Handles GET requests - loads subscription data and calculates metrics
        /// </summary>
        public void OnGet()
        {
            // Load mock subscription data
            // In production, this would fetch from a database
            Subscriptions = new List<Subscription>
            {
                new() { ServiceName = "Netflix 4K", Price = 599m, BillingCycle = "Monthly", Category = "Entertainment", NextPaymentDate = DateTime.Today.AddDays(2) },
                new() { ServiceName = "Spotify Duo", Price = 299m, BillingCycle = "Monthly", Category = "Entertainment", NextPaymentDate = DateTime.Today.AddDays(15) },
                new() { ServiceName = "Adobe Cloud", Price = 2799m, BillingCycle = "Monthly", Category = "Work", NextPaymentDate = DateTime.Today.AddDays(20) },
                new() { ServiceName = "Amazon Prime", Price = 6990m, BillingCycle = "Yearly", Category = "Utility", NextPaymentDate = DateTime.Today.AddMonths(4) },
            };

            // Calculate total monthly recurring costs
            TotalMonthly = Subscriptions.Where(x => x.BillingCycle == "Monthly").Sum(x => x.Price);

            // Calculate yearly projection: (Monthly * 12) + Yearly subscriptions
            YearlyProjected = (TotalMonthly * 12) + Subscriptions.Where(x => x.BillingCycle == "Yearly").Sum(x => x.Price);

            // Count subscriptions due in the next 5 days
            DueSoonCount = Subscriptions.Count(x => (x.NextPaymentDate - DateTime.Today).TotalDays <= 5);
        }
    }
}
