using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoSallonSolution.Models;
using AutoSallonSolution.Data;
using System.Security.Claims;

namespace AutoSallonSolution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteVehiclesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FavoriteVehiclesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetFavoriteVehicles()
        {
            var favorites = await _context.FavoriteVehicles
                .Select(f => new
                {
                    f.Id,
                    f.VehicleId,
                    f.AddedAt,
                    Vehicle = _context.Vehicles.FirstOrDefault(v => v.Id == f.VehicleId)
                })
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpPost("{vehicleId}")]
        public async Task<IActionResult> AddFavoriteVehicle(int vehicleId, [FromQuery] string? userId)
        {
            userId ??= "test-user";

            // Check if vehicle exists
            var vehicle = await _context.Vehicles.FindAsync(vehicleId);
            if (vehicle == null)
                return NotFound("Vehicle not found");

            var existingFavorite = await _context.FavoriteVehicles
                .FirstOrDefaultAsync(f => f.UserId == userId && f.VehicleId == vehicleId);

            if (existingFavorite != null)
                return BadRequest("Vehicle is already in favorites");

            var favorite = new FavoriteVehicle
            {
                UserId = userId,
                VehicleId = vehicleId
            };

            _context.FavoriteVehicles.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                favorite.Id,
                favorite.VehicleId,
                favorite.AddedAt,
                Vehicle = vehicle
            });
        }

        [HttpDelete("{vehicleId}")]
        public async Task<IActionResult> RemoveFavoriteVehicle(int vehicleId, [FromQuery] string? userId)
        {
            userId ??= "test-user";

            var favorite = await _context.FavoriteVehicles
                .FirstOrDefaultAsync(f => f.UserId == userId && f.VehicleId == vehicleId);

            if (favorite == null)
                return NotFound("Favorite vehicle not found");

            _context.FavoriteVehicles.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
} 