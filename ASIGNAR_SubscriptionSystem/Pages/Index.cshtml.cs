using Microsoft.AspNetCore.Mvc.RazorPages;
using SubscriptionSystem.Models; // Make sure this matches your project name
using System;
using System.Collections.Generic;
using System.Linq;

namespace SubscriptionSystem.Pages
{
    public class IndexModel : PageModel
    {
        // These variables hold data for the HTML page to read
        public List<Subscription> Subscriptions { get; set; } = new List<Subscription>();
        public decimal TotalMonthly { get; set; }
        public decimal YearlyProjected { get; set; }
        public int DueSoonCount { get; set; }

        public void OnGet()
        {
            // 1. Create Mock Data (Same as before)
            Subscriptions = new List<Subscription>
            {
                new() { ServiceName = "Netflix 4K", Price = 19.99m, BillingCycle = "Monthly", Category = "Entertainment", NextPaymentDate = DateTime.Today.AddDays(2) },
                new() { ServiceName = "Spotify Duo", Price = 12.99m, BillingCycle = "Monthly", Category = "Entertainment", NextPaymentDate = DateTime.Today.AddDays(15) },
                new() { ServiceName = "Adobe Cloud", Price = 54.99m, BillingCycle = "Monthly", Category = "Work", NextPaymentDate = DateTime.Today.AddDays(20) },
                new() { ServiceName = "Amazon Prime", Price = 139.00m, BillingCycle = "Yearly", Category = "Utility", NextPaymentDate = DateTime.Today.AddMonths(4) },
            };

            // 2. Perform Calculations
            TotalMonthly = Subscriptions.Where(x => x.BillingCycle == "Monthly").Sum(x => x.Price);

            // Calculate yearly: (Monthly * 12) + Yearly items
            YearlyProjected = (TotalMonthly * 12) + Subscriptions.Where(x => x.BillingCycle == "Yearly").Sum(x => x.Price);

            // Count items due in the next 5 days
            DueSoonCount = Subscriptions.Count(x => (x.NextPaymentDate - DateTime.Today).TotalDays <= 5);
        }
    }
}