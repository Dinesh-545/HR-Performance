using Microsoft.EntityFrameworkCore;
using HRPerformance.Api.Models.Entities;

namespace HRPerformance.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewCycle> ReviewCycles { get; set; }
        public DbSet<ReviewTemplate> ReviewTemplates { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<EmployeeSkill> EmployeeSkills { get; set; }
        public DbSet<SkillRating> SkillRatings { get; set; }
        public DbSet<DevelopmentPlan> DevelopmentPlans { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Manager)
                .WithMany(m => m.Subordinates)
                .HasForeignKey(e => e.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany()
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewee)
                .WithMany()
                .HasForeignKey(r => r.RevieweeId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<SkillRating>()
                .HasOne(sr => sr.RatedBy)
                .WithMany()
                .HasForeignKey(sr => sr.RatedById)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 