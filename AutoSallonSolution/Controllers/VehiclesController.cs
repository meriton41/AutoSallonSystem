using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoSallonSolution.Models;
using AutoSallonSolution.Data;
using Microsoft.AspNetCore.SignalR;
using AutoSallonSolution.Hubs;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using SharedClassLibrary.DTOs;

namespace AutoSallonSolution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<VehicleHub> _hubContext;
        private readonly ILogger<VehiclesController> _logger;

        // Static data for vehicle attributes
        private static readonly string[] Brands = new[]
        {
            "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Toyota", "Honda", "Ford", "Chevrolet",
            "Nissan", "Hyundai", "Kia", "Mazda", "Subaru", "Lexus", "Porsche", "Ferrari", "Lamborghini",
            "Maserati", "Bentley", "Rolls-Royce"
        };

        private static readonly string[] FuelTypes = new[]
        {
            "Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid", "Natural Gas", "Hydrogen"
        };

        private static readonly string[] Transmissions = new[]
        {
            "Automatic", "Manual", "Semi-Automatic", "CVT"
        };

        private static readonly string[] Colors = new[]
        {
            "Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Orange", "Purple",
            "Brown", "Beige", "Gold", "Bronze", "Navy Blue", "Burgundy", "Teal", "Pink"
        };

        public VehiclesController(
            ApplicationDbContext context, 
            IHubContext<VehicleHub> hubContext,
            ILogger<VehiclesController> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetVehicles(
            [FromQuery] string searchTerm = "",
            [FromQuery] string brand = "",
            [FromQuery] int? minYear = null,
            [FromQuery] int? maxYear = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string fuel = "",
            [FromQuery] string transmission = "",
            [FromQuery] string color = "")
        {
            try
            {
                _logger.LogInformation("Getting vehicles with filters: SearchTerm={SearchTerm}, Brand={Brand}, MinYear={MinYear}, MaxYear={MaxYear}, MinPrice={MinPrice}, MaxPrice={MaxPrice}, Fuel={Fuel}, Transmission={Transmission}, Color={Color}",
                    searchTerm, brand, minYear, maxYear, minPrice, maxPrice, fuel, transmission, color);

                var query = _context.Vehicles.AsQueryable();

                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    query = query.Where(v => v.Title.Contains(searchTerm));
                }

                if (!string.IsNullOrWhiteSpace(brand))
                {
                    query = query.Where(v => v.Brand == brand);
                }

                if (minYear.HasValue)
                {
                    query = query.Where(v => v.Year >= minYear.Value);
                }

                if (maxYear.HasValue)
                {
                    query = query.Where(v => v.Year <= maxYear.Value);
                }

                if (minPrice.HasValue)
                {
                    query = query.Where(v => v.Price >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    query = query.Where(v => v.Price <= maxPrice.Value);
                }

                if (!string.IsNullOrWhiteSpace(fuel))
                {
                    query = query.Where(v => v.Fuel == fuel);
                }

                if (!string.IsNullOrWhiteSpace(transmission))
                {
                    query = query.Where(v => v.Transmission == transmission);
                }

                if (!string.IsNullOrWhiteSpace(color))
                {
                    query = query.Where(v => v.Color == color);
                }

                var vehicles = await query.ToListAsync();
                _logger.LogInformation("Retrieved {Count} vehicles", vehicles.Count);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles");
                return StatusCode(500, new { message = "An error occurred while retrieving vehicles", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehicle(int id)
        {
            try
            {
                _logger.LogInformation("Getting vehicle with ID: {Id}", id);
                var vehicle = await _context.Vehicles.FindAsync(id);
                
                if (vehicle == null)
                {
                    _logger.LogWarning("Vehicle not found with ID: {Id}", id);
                    return NotFound(new { message = $"Vehicle with ID {id} not found" });
                }

                return Ok(vehicle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicle with ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the vehicle", error = ex.Message });
            }
        }

        [HttpGet("brands")]
        public IActionResult GetBrands()
        {
            try
            {
                _logger.LogInformation("Getting available brands");
                return Ok(Brands);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting brands");
                return StatusCode(500, new { message = "An error occurred while retrieving brands", error = ex.Message });
            }
        }

        [HttpGet("fueltypes")]
        public IActionResult GetFuelTypes()
        {
            try
            {
                _logger.LogInformation("Getting available fuel types");
                return Ok(FuelTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting fuel types");
                return StatusCode(500, new { message = "An error occurred while retrieving fuel types", error = ex.Message });
            }
        }

        [HttpGet("transmissions")]
        public IActionResult GetTransmissions()
        {
            try
            {
                _logger.LogInformation("Getting available transmission types");
                return Ok(Transmissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transmission types");
                return StatusCode(500, new { message = "An error occurred while retrieving transmission types", error = ex.Message });
            }
        }

        [HttpGet("colors")]
        public IActionResult GetColors()
        {
            try
            {
                _logger.LogInformation("Getting available colors");
                return Ok(Colors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting colors");
                return StatusCode(500, new { message = "An error occurred while retrieving colors", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateVehicle([FromBody] VehicleDTO vehicleDTO)
        {
            try
            {
                _logger.LogInformation("Received vehicle creation request: {Vehicle}", JsonSerializer.Serialize(vehicleDTO));

                if (vehicleDTO == null)
                {
                    _logger.LogWarning("Vehicle creation failed: Vehicle object is null");
                    return BadRequest(new { message = "Vehicle object is null" });
                }

                // Log the incoming data
                _logger.LogInformation("Received vehicle data: Title={Title}, Brand={Brand}, Fuel={Fuel}, Transmission={Transmission}, Color={Color}, Year={Year}, Price={Price}",
                    vehicleDTO.Title, vehicleDTO.Brand, vehicleDTO.Fuel, vehicleDTO.Transmission, vehicleDTO.Color, vehicleDTO.Year, vehicleDTO.Price);

                // Validate required fields
                var validationResults = new List<ValidationResult>();
                var validationContext = new ValidationContext(vehicleDTO, null, null);
                if (!Validator.TryValidateObject(vehicleDTO, validationContext, validationResults, true))
                {
                    var errors = validationResults.Select(vr => vr.ErrorMessage);
                    _logger.LogWarning("Vehicle creation failed: Validation errors: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { message = "Validation failed", errors });
                }

                if (!Brands.Contains(vehicleDTO.Brand))
                {
                    _logger.LogWarning("Vehicle creation failed: Invalid brand: {Brand}", vehicleDTO.Brand);
                    return BadRequest(new { message = $"Invalid brand. Allowed values: {string.Join(", ", Brands)}" });
                }

                if (!FuelTypes.Contains(vehicleDTO.Fuel))
                {
                    _logger.LogWarning("Vehicle creation failed: Invalid fuel type: {Fuel}", vehicleDTO.Fuel);
                    return BadRequest(new { message = $"Invalid fuel type. Allowed values: {string.Join(", ", FuelTypes)}" });
                }

                if (!Transmissions.Contains(vehicleDTO.Transmission))
                {
                    _logger.LogWarning("Vehicle creation failed: Invalid transmission: {Transmission}", vehicleDTO.Transmission);
                    return BadRequest(new { message = $"Invalid transmission. Allowed values: {string.Join(", ", Transmissions)}" });
                }

                if (!Colors.Contains(vehicleDTO.Color))
                {
                    _logger.LogWarning("Vehicle creation failed: Invalid color: {Color}", vehicleDTO.Color);
                    return BadRequest(new { message = $"Invalid color. Allowed values: {string.Join(", ", Colors)}" });
                }

                var vehicle = new Vehicle
                {
                    Title = vehicleDTO.Title,
                    Brand = vehicleDTO.Brand,
                    Fuel = vehicleDTO.Fuel,
                    Transmission = vehicleDTO.Transmission,
                    Color = vehicleDTO.Color,
                    Year = vehicleDTO.Year,
                    Price = vehicleDTO.Price,
                    Image = vehicleDTO.Image,
                    Mileage = vehicleDTO.Mileage,
                    BrandLogo = vehicleDTO.BrandLogo,
                    Engine = vehicleDTO.Engine,

                    Power = vehicleDTO.Power,
                    Description = vehicleDTO.Description,
                    InteriorColor = vehicleDTO.InteriorColor
                };

                try
                {
                    _logger.LogInformation("Attempting to add vehicle to database");
                    _context.Vehicles.Add(vehicle);
                    _logger.LogInformation("Attempting to save changes to database");
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Vehicle created successfully with ID: {Id}", vehicle.Id);

                    await _hubContext.Clients.All.SendAsync("VehicleAdded", new
                    {
                        title = vehicle.Title,
                        image = vehicle.Image
                    });
                    return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
                }
                catch (DbUpdateException dbEx)
                {
                    _logger.LogError(dbEx, "Database error while creating vehicle. Inner exception: {InnerException}", dbEx.InnerException?.Message);
                    _logger.LogError("Stack trace: {StackTrace}", dbEx.StackTrace);
                    return StatusCode(500, new { message = "Database error while creating vehicle", error = dbEx.InnerException?.Message ?? dbEx.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating vehicle. Message: {Message}, Stack trace: {StackTrace}", ex.Message, ex.StackTrace);
                return StatusCode(500, new { message = "An error occurred while creating the vehicle", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] VehicleDTO vehicleDTO)
        {
            try
            {
                _logger.LogInformation("Received vehicle update request for ID {Id}: {Vehicle}", id, JsonSerializer.Serialize(vehicleDTO));

                if (vehicleDTO == null)
                {
                    _logger.LogWarning("Vehicle update failed: Vehicle object is null");
                    return BadRequest(new { message = "Vehicle object is null" });
                }

                // Validate required fields
                var validationResults = new List<ValidationResult>();
                var validationContext = new ValidationContext(vehicleDTO, null, null);
                if (!Validator.TryValidateObject(vehicleDTO, validationContext, validationResults, true))
                {
                    var errors = validationResults.Select(vr => vr.ErrorMessage);
                    _logger.LogWarning("Vehicle update failed: Validation errors: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { message = "Validation failed", errors });
                }

                if (!Brands.Contains(vehicleDTO.Brand))
                {
                    _logger.LogWarning("Vehicle update failed: Invalid brand: {Brand}", vehicleDTO.Brand);
                    return BadRequest(new { message = $"Invalid brand. Allowed values: {string.Join(", ", Brands)}" });
                }

                if (!FuelTypes.Contains(vehicleDTO.Fuel))
                {
                    _logger.LogWarning("Vehicle update failed: Invalid fuel type: {Fuel}", vehicleDTO.Fuel);
                    return BadRequest(new { message = $"Invalid fuel type. Allowed values: {string.Join(", ", FuelTypes)}" });
                }

                if (!Transmissions.Contains(vehicleDTO.Transmission))
                {
                    _logger.LogWarning("Vehicle update failed: Invalid transmission: {Transmission}", vehicleDTO.Transmission);
                    return BadRequest(new { message = $"Invalid transmission. Allowed values: {string.Join(", ", Transmissions)}" });
                }

                if (!Colors.Contains(vehicleDTO.Color))
                {
                    _logger.LogWarning("Vehicle update failed: Invalid color: {Color}", vehicleDTO.Color);
                    return BadRequest(new { message = $"Invalid color. Allowed values: {string.Join(", ", Colors)}" });
                }

                var vehicle = await _context.Vehicles.FindAsync(id);
                if (vehicle == null)
                {
                    _logger.LogWarning("Vehicle update failed: Vehicle not found with ID: {Id}", id);
                    return NotFound(new { message = $"Vehicle with ID {id} not found" });
                }

                // Update vehicle properties
                vehicle.Title = vehicleDTO.Title;
                vehicle.Brand = vehicleDTO.Brand;
                vehicle.Fuel = vehicleDTO.Fuel;
                vehicle.Transmission = vehicleDTO.Transmission;
                vehicle.Color = vehicleDTO.Color;
                vehicle.Year = vehicleDTO.Year;
                vehicle.Price = vehicleDTO.Price;
                vehicle.Image = vehicleDTO.Image;
                vehicle.Mileage = vehicleDTO.Mileage;
                vehicle.BrandLogo = vehicleDTO.BrandLogo;
                vehicle.Engine = vehicleDTO.Engine;
                vehicle.Power = vehicleDTO.Power;
                vehicle.Description = vehicleDTO.Description;
                vehicle.InteriorColor = vehicleDTO.InteriorColor;

                try
                {
                    _context.Entry(vehicle).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Vehicle updated successfully with ID: {Id}", id);

                    await _hubContext.Clients.All.SendAsync("VehicleUpdated", vehicle);
                    return Ok(vehicle);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!VehicleExists(id))
                    {
                        _logger.LogWarning("Vehicle update failed: Vehicle no longer exists with ID: {Id}", id);
                        return NotFound(new { message = $"Vehicle with ID {id} no longer exists" });
                    }
                    else
                    {
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle with ID: {Id}. Error details: {ErrorDetails}", id, ex.ToString());
                return StatusCode(500, new { message = "An error occurred while updating the vehicle", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            try
            {
                _logger.LogInformation("Deleting vehicle with ID: {Id}", id);
                var vehicle = await _context.Vehicles.FindAsync(id);
                if (vehicle == null)
                {
                    _logger.LogWarning("Vehicle deletion failed: Vehicle not found with ID: {Id}", id);
                    return NotFound(new { message = $"Vehicle with ID {id} not found" });
                }

                _context.Vehicles.Remove(vehicle);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Vehicle deleted successfully");

                await _hubContext.Clients.All.SendAsync("VehicleDeleted", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle with ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the vehicle", error = ex.Message });
            }
        }

        private bool VehicleExists(int id)
        {
            return _context.Vehicles.Any(e => e.Id == id);
        }
    }
}
