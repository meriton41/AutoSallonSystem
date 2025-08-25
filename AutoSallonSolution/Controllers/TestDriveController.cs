using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoSallonSolution.Data;
using AutoSallonSolution.Models;
using AutoSallonSolution.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace AutoSallonSolution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class TestDriveController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestDriveController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/TestDrive
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestDrive>>> GetTestDrives()
        {
            return await _context.TestDrives
                .Include(t => t.Vehicle)
                .Include(t => t.User)
                .ToListAsync();
        }

        // GET: api/TestDrive/user
        [Authorize]
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<TestDrive>>> GetUserTestDrives()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return await _context.TestDrives
                .Include(t => t.Vehicle)
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        // POST: api/TestDrive
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<TestDrive>> CreateTestDrive(TestDriveDTO testDriveDto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Verify the vehicle exists
            var vehicle = await _context.Vehicles.FindAsync(testDriveDto.VehicleId);
            if (vehicle == null)
            {
                return BadRequest("Vehicle not found");
            }

            // Create new test drive from DTO
            var newTestDrive = new TestDrive
            {
                UserId = userId,
                VehicleId = testDriveDto.VehicleId,
                Description = testDriveDto.Description,
                Date = testDriveDto.Date,
                Status = "Planned",
                AddedAt = DateTime.UtcNow
            };

            _context.TestDrives.Add(newTestDrive);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTestDrive), new { id = newTestDrive.Id }, newTestDrive);
        }

        // GET: api/TestDrive/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<TestDrive>> GetTestDrive(int id)
        {
            var testDrive = await _context.TestDrives
                .Include(t => t.Vehicle)
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (testDrive == null)
            {
                return NotFound();
            }

            return testDrive;
        }

        // PUT: api/TestDrive/5
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTestDrive(int id, TestDriveDTO testDriveDto)
        {
            var existingTestDrive = await _context.TestDrives.FindAsync(id);
            if (existingTestDrive == null)
            {
                return NotFound();
            }

            // Update both description and status
            existingTestDrive.Description = testDriveDto.Description;
            existingTestDrive.Status = testDriveDto.Status;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TestDriveExists(id))
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

        

        // DELETE: api/TestDrive/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTestDrive(int id)
        {
            var testDrive = await _context.TestDrives.FindAsync(id);
            if (testDrive == null)
            {
                return NotFound();
            }

            _context.TestDrives.Remove(testDrive);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TestDriveExists(int id)
        {
            return _context.TestDrives.Any(e => e.Id == id);
        }
    }
}