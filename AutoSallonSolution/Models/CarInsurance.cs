using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoSallonSolution.Models
{
    public class CarInsurance
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string PolicyNumber { get; set; }
        
        [Required]
        public int VehicleId { get; set; }
        
        [ForeignKey("VehicleId")]
        public Vehicle? Vehicle { get; set; }
        
        [Required]
        public string ClientName { get; set; }
        [Required]
        [EmailAddress]
        public string ClientEmail { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required]
        public string CoverageDetails { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
    }
}

