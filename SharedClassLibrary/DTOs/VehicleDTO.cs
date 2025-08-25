using System.ComponentModel.DataAnnotations;

namespace SharedClassLibrary.DTOs
{
    public class VehicleDTO
    {
        [Required(ErrorMessage = "Title is required")]
        public required string Title { get; set; }

        [Required(ErrorMessage = "Image URL is required")]
        public string Image { get; set; }

        [Required(ErrorMessage = "Year is required")]
        [Range(1900, 2100, ErrorMessage = "Year must be between 1900 and 2100")]
        public int Year { get; set; }

        [Required(ErrorMessage = "Mileage is required")]
        public string Mileage { get; set; }

        [Required(ErrorMessage = "Brand is required")]
        public string Brand { get; set; }

        [Required(ErrorMessage = "Brand logo URL is required")]
        public string BrandLogo { get; set; }

        [Required(ErrorMessage = "Engine details are required")]
        public string Engine { get; set; }

        [Required(ErrorMessage = "Fuel type is required")]
        public string Fuel { get; set; }

        [Required(ErrorMessage = "Power details are required")]
        public string Power { get; set; }

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Transmission type is required")]
        public string Transmission { get; set; }

        [Required(ErrorMessage = "Color is required")]
        public string Color { get; set; }

        [Required(ErrorMessage = "Interior color is required")]
        public string InteriorColor { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }
    }
} 