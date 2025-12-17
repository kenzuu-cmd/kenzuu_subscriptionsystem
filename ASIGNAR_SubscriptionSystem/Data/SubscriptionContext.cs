using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;

namespace ASIGNAR_SubscriptionSystem.Data
{
    public class SubscriptionContext : DbContext
    {
        public SubscriptionContext(DbContextOptions<SubscriptionContext> options)
            : base(options)
        {
        }

        public DbSet<Subscription> Subscriptions { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Additional configuration for Subscription entity
            modelBuilder.Entity<Subscription>(entity =>
            {
                entity.Property(e => e.Price)
                    .HasPrecision(18, 2);
            });

            // Configuration for Notification entity
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasIndex(e => e.IsRead);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.SubscriptionId);

                // Optional relationship - notification can exist without subscription
                entity.HasOne(e => e.Subscription)
                    .WithMany()
                    .HasForeignKey(e => e.SubscriptionId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
