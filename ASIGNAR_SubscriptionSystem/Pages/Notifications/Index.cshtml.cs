using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Data;

namespace ASIGNAR_SubscriptionSystem.Pages.Notifications
{
    public class IndexModel : PageModel
    {
        private readonly SubscriptionContext _context;

        public IndexModel(SubscriptionContext context)
        {
            _context = context;
        }

        public IList<Notification> Notifications { get; set; } = default!;

        public async Task OnGetAsync()
        {
            Notifications = await _context.Notifications
                .Include(n => n.Subscription)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
    }
}
