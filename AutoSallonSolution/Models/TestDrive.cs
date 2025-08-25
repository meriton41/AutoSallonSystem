using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AutoSallonSolution.Data;
using SharedClassLibrary.DTOs;

namespace AutoSallonSolution.Models
{
    public class TestDrive
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("User")]
        public string UserId { get; set; }

        [Required]
        [ForeignKey("Vehicle")]
        public int VehicleId { get; set; }

        public string Description { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser User { get; set; }
        public Vehicle Vehicle { get; set; }
    }
} 