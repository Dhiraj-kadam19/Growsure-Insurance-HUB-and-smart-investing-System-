using Microsoft.EntityFrameworkCore;
using Growsure.Api.Models;

namespace Growsure.Api.Data
{
    public class GrowsureContext : DbContext
    {
        public GrowsureContext(DbContextOptions<GrowsureContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<PolicyHolder> PolicyHolders { get; set; } = null!;
        public DbSet<Insurer> Insurers { get; set; } = null!;
        public DbSet<Policy> Policies { get; set; } = null!;
        public DbSet<PurchasedPolicy> PurchasedPolicies { get; set; } = null!;
        public DbSet<Nominee> Nominees { get; set; } = null!;
        public DbSet<Claim> Claims { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<Fund> Funds { get; set; } = null!;
        public DbSet<Investment> Investments { get; set; } = null!;
        public DbSet<AIRecommendation> AIRecommendations { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
