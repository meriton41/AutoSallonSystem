using System;
using System.ComponentModel.DataAnnotations;

namespace AutoSallonSolution.Models
{
    public class FavoriteVehicle
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public int VehicleId { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
} 