using System;
using System.ComponentModel.DataAnnotations;

namespace AutoSallonSolution.DTOs
{
    public class CreateCarInsuranceDTO
    {
        [Required]
        public string PolicyNumber { get; set; }

        [Required]
        public int VehicleId { get; set; }

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

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
    }

    public class UpdateCarInsuranceDTO
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        public string PolicyNumber { get; set; }

        [Required]
        public int VehicleId { get; set; }

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

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
    }
}