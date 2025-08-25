using System.ComponentModel.DataAnnotations;

namespace AutoSallonSolution.DTOs
{
    public class TestDriveDTO
    {
        [Required]
        public int VehicleId { get; set; }

        public string Description { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public string Status { get; set; }
    }

   
}
