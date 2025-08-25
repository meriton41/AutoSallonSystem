using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SharedClassLibrary.DTOs;
using AutoSallonSolution.Models;

namespace AutoSallonSolution.Data
{
    using SharedClassLibrary.DTOs;

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public override DbSet<ApplicationUser> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<FavoriteVehicle> FavoriteVehicles { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<CarInsurance> CarInsurances { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<TestDrive> TestDrives { get; set; }
        public DbSet<Order> Orders { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Vehicle>()
                .Property(v => v.Price)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasColumnType("decimal(18,2)");

            // Configure FavoriteVehicle relationships
            builder.Entity<FavoriteVehicle>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<FavoriteVehicle>()
                .HasOne<Vehicle>()
                .WithMany()
                .HasForeignKey(f => f.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure CarInsurance relationships
            builder.Entity<CarInsurance>()
                .HasOne(ci => ci.Vehicle)
                .WithMany(v => v.CarInsurances)
                .HasForeignKey(ci => ci.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Bill relationships
            builder.Entity<Bill>()
                .HasOne(b => b.Vehicle)
                .WithMany(v => v.Bills)
                .HasForeignKey(b => b.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure TestDrive relationships
            builder.Entity<TestDrive>()
                .HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TestDrive>()
                .HasOne(t => t.Vehicle)
                .WithMany()
                .HasForeignKey(t => t.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Order relationships
            builder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Order>()
                .HasOne(o => o.Vehicle)
                .WithMany()
                .HasForeignKey(o => o.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure decimal precision for CarInsurance and Bill
            builder.Entity<CarInsurance>()
                .Property(ci => ci.Price)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Bill>()
                .Property(b => b.Amount)
                .HasColumnType("decimal(18,2)");
        }
    }
}
