using Microsoft.EntityFrameworkCore;
using SubscriptionSystem.Models;
using ASIGNAR_SubscriptionSystem.Models;

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
        public DbSet<Users> Users { get; set; } = null!;

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

            // Configuration for Users entity
            modelBuilder.Entity<Users>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Seed data for admin user
            modelBuilder.Entity<Users>().HasData(
                new Users
                {
                    Id = 1,
                    Username = "Admin",
                    Password = "Admin123", // In production, use hashed passwords!
                    Email = "admin@subwise.com",
                    Role = "Admin",
                    CreatedAt = new DateTime(2026, 1, 1)
                }
            );
        }
    }
}
