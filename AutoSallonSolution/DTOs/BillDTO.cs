using System;
using System.ComponentModel.DataAnnotations;

namespace AutoSallonSolution.DTOs
{
    public class CreateBillDTO
    {
        [Required(ErrorMessage = "Client name is required")]
        public string ClientName { get; set; }

        [Required(ErrorMessage = "Client email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string ClientEmail { get; set; }
        
        [Required(ErrorMessage = "Vehicle ID is required")]
        public int VehicleId { get; set; }
        
        [Required(ErrorMessage = "Amount is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Date is required")]
        public DateTime Date { get; set; }
    }
} 