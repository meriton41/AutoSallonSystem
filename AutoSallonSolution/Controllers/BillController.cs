using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoSallonSolution.Models;
using AutoSallonSolution.Data;
using AutoSallonSolution.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AutoSallonSolution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class BillController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BillController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Bill
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Bill>>> GetBills()
        {
            return await _context.Bills
                .Include(b => b.Vehicle)
                .ToListAsync();
        }

        // GET: api/Bill/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Bill>> GetBill(Guid id)
        {
            var bill = await _context.Bills
                .Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (bill == null)
            {
                return NotFound();
            }

            return bill;
        }

        // GET: api/Bill/vehicle/5
        [HttpGet("vehicle/{vehicleId}")]
        public async Task<ActionResult<IEnumerable<Bill>>> GetBillsByVehicle(int vehicleId)
        {
            return await _context.Bills
                .Include(b => b.Vehicle)
                .Where(b => b.VehicleId == vehicleId)
                .ToListAsync();
        }

        // POST: api/Bill
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Bill>> CreateBill([FromBody] CreateBillDTO billDto)
        {
            if (billDto == null)
                return BadRequest("Bill data is required");

            // Check if vehicle exists
            var vehicle = await _context.Vehicles.FindAsync(billDto.VehicleId);
            if (vehicle == null)
                return BadRequest($"Vehicle with ID {billDto.VehicleId} not found");

            var bill = new Bill
            {
                Id = Guid.NewGuid(),
                ClientName = billDto.ClientName,
                ClientEmail = billDto.ClientEmail,
                VehicleId = billDto.VehicleId,
                Amount = billDto.Amount,
                Description = billDto.Description,
                Date = billDto.Date
            };

            try
            {
                _context.Bills.Add(bill);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetBill), new { id = bill.Id }, bill);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating bill: {ex.Message}");
            }
        }

        // PUT: api/Bill/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBill(Guid id, [FromBody] Bill bill)
        {
            if (bill == null || id != bill.Id)
                return BadRequest();

            // Check if vehicle exists
            var vehicle = await _context.Vehicles.FindAsync(bill.VehicleId);
            if (vehicle == null)
                return BadRequest("Invalid VehicleId");

            var existingBill = await _context.Bills.FindAsync(id);
            if (existingBill == null)
                return NotFound();

            // Update properties
            existingBill.ClientName = bill.ClientName;
            existingBill.ClientEmail = bill.ClientEmail;
            existingBill.VehicleId = bill.VehicleId;
            existingBill.Amount = bill.Amount;
            existingBill.Description = bill.Description;
            existingBill.Date = bill.Date;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BillExists(id))
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

        // DELETE: api/Bill/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBill(Guid id)
        {
            var bill = await _context.Bills.FindAsync(id);
            if (bill == null)
                return NotFound();

            _context.Bills.Remove(bill);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BillExists(Guid id)
        {
            return _context.Bills.Any(e => e.Id == id);
        }
    }
}
