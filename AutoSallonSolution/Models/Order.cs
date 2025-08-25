using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AutoSallonSolution.Data;

namespace AutoSallonSolution.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        [Required]
        public int VehicleId { get; set; }

        [ForeignKey("VehicleId")]
        public Vehicle Vehicle { get; set; }

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Completed, Cancelled

        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Failed
        public DateTime? PaymentDate { get; set; }

        public string? ShippingAddress { get; set; }
        public string? ShippingMethod { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }

        public string? AdminNotes { get; set; }
        public string? UserNotes { get; set; }
        public DateTime? AdminActionDate { get; set; }
        public string? AdminActionBy { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime? CancellationDate { get; set; }
        public string? CancellationReason { get; set; }
    }
} 