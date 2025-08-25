using AutoSallonSolution.Data;
using AutoSallonSolution.Models;
using AutoSallonSolution.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using AutoSallonSolution.Hubs;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using SharedClassLibrary.DTOs;

namespace AutoSallonSolution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class CarInsuranceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CarInsuranceController> _logger;

        public CarInsuranceController(ApplicationDbContext context, ILogger<CarInsuranceController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var insurances = await _context.CarInsurances
                .Include(ci => ci.Vehicle)
                .Select(ci => new
                {
                    ci.Id,
                    ci.PolicyNumber,
                    ci.VehicleId,
                    ci.ClientName,
                    ci.ClientEmail,
                    ci.StartDate,
                    ci.EndDate,
                    ci.CoverageDetails,
                    ci.Price,
                    Vehicle = new
                    {
                        ci.Vehicle.Id,
                        ci.Vehicle.Title,
                        ci.Vehicle.Brand,
                        ci.Vehicle.Year,
                        ci.Vehicle.Color
                    }
                })
                .ToListAsync();
            
            return Ok(insurances);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetById(Guid id)
        {
            var insurance = await _context.CarInsurances
                .Include(ci => ci.Vehicle)
                .Select(ci => new
                {
                    ci.Id,
                    ci.PolicyNumber,
                    ci.VehicleId,
                    ci.ClientName,
                    ci.ClientEmail,
                    ci.StartDate,
                    ci.EndDate,
                    ci.CoverageDetails,
                    ci.Price,
                    Vehicle = new
                    {
                        ci.Vehicle.Id,
                        ci.Vehicle.Title,
                        ci.Vehicle.Brand,
                        ci.Vehicle.Year,
                        ci.Vehicle.Color
                    }
                })
                .FirstOrDefaultAsync(ci => ci.Id == id);

            if (insurance == null)
            {
                return NotFound();
            }

            return Ok(insurance);
        }

        [HttpGet("vehicle/{vehicleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetByVehicleId(int vehicleId)
        {
            var insurances = await _context.CarInsurances
                .Include(ci => ci.Vehicle)
                .Where(ci => ci.VehicleId == vehicleId)
                .Select(ci => new
                {
                    ci.Id,
                    ci.PolicyNumber,
                    ci.VehicleId,
                    ci.ClientName,
                    ci.ClientEmail,
                    ci.StartDate,
                    ci.EndDate,
                    ci.CoverageDetails,
                    ci.Price,
                    Vehicle = new
                    {
                        ci.Vehicle.Id,
                        ci.Vehicle.Title,
                        ci.Vehicle.Brand,
                        ci.Vehicle.Year,
                        ci.Vehicle.Color
                    }
                })
                .ToListAsync();
            
            return Ok(insurances);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CarInsurance>> Create(CreateCarInsuranceDTO dto)
        {
            _logger.LogInformation("Received CarInsurance creation request: {@Dto}", dto);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                // Check if vehicle exists
                var vehicle = await _context.Vehicles.FindAsync(dto.VehicleId);
                if (vehicle == null)
                {
                    _logger.LogWarning("Vehicle not found with ID: {VehicleId}", dto.VehicleId);
                    return BadRequest($"Invalid VehicleId: {dto.VehicleId}");
                }

                // Check if vehicle already has insurance
                var existing = await _context.CarInsurances
                    .FirstOrDefaultAsync(ci => ci.VehicleId == dto.VehicleId);
                if (existing != null)
                {
                    _logger.LogWarning("Vehicle {VehicleId} already has insurance", dto.VehicleId);
                    return BadRequest("This vehicle already has an insurance assigned.");
                }

                // Validate dates
                if (dto.EndDate <= dto.StartDate)
                {
                    _logger.LogWarning("Invalid dates: StartDate={StartDate}, EndDate={EndDate}", 
                        dto.StartDate, dto.EndDate);
                    return BadRequest("End date must be after start date");
                }

                var insurance = new CarInsurance
                {
                    PolicyNumber = dto.PolicyNumber,
                    VehicleId = dto.VehicleId,
                    ClientName = dto.ClientName,
                    ClientEmail = dto.ClientEmail,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    CoverageDetails = dto.CoverageDetails,
                    Price = dto.Price
                };

                _context.CarInsurances.Add(insurance);
                await _context.SaveChangesAsync();
                
                return CreatedAtAction(nameof(GetById), new { id = insurance.Id }, insurance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating insurance");
                return StatusCode(500, new { message = "An error occurred while creating the insurance", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, UpdateCarInsuranceDTO dto)
        {
            if (id != dto.Id)
            {
                return BadRequest();
            }

            var insurance = await _context.CarInsurances.FindAsync(id);
            if (insurance == null)
            {
                return NotFound();
            }

            insurance.PolicyNumber = dto.PolicyNumber;
            insurance.VehicleId = dto.VehicleId;
            insurance.ClientName = dto.ClientName;
            insurance.ClientEmail = dto.ClientEmail;
            insurance.StartDate = dto.StartDate;
            insurance.EndDate = dto.EndDate;
            insurance.CoverageDetails = dto.CoverageDetails;
            insurance.Price = dto.Price;

            try
            {
            await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InsuranceExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var insurance = await _context.CarInsurances.FindAsync(id);
            if (insurance == null)
            {
                return NotFound();
            }

            _context.CarInsurances.Remove(insurance);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InsuranceExists(Guid id)
        {
            return _context.CarInsurances.Any(e => e.Id == id);
        }
    }
}
