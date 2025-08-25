using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AutoSallonSolution.Models
{
    public class Bill
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Client name is required")]
        public string ClientName { get; set; }

        [Required(ErrorMessage = "Client email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string ClientEmail { get; set; }

        [Required(ErrorMessage = "Vehicle ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Vehicle ID must be greater than 0")]
        public int VehicleId { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Date is required")]
        public DateTime Date { get; set; }

        [JsonIgnore]
        public virtual Vehicle? Vehicle { get; set; }
    }
}
