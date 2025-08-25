using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoSallonSolution.Models;
using AutoSallonSolution.DTOs;
using AutoSallonSolution.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AutoSallonSolution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeasingCalculatorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeasingCalculatorController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeasingCalculatorDTO>>> GetLeasings()
        {
            var leasings = await _context.Set<LeasingCalculator>()
                .Include(l => l.Vehicle)
                .Select(l => new LeasingCalculatorDTO
                {
                    Id = l.Id,
                    ClientName = l.ClientName,
                    VehicleId = l.VehicleId,
                    LeaseTerm = l.LeaseTerm,
                    DownPayment = l.DownPayment,
                    InterestRate = l.InterestRate,
                    MonthlyPayment = l.MonthlyPayment,
                    StartDate = l.StartDate
                })
                .ToListAsync();

            return Ok(leasings);
        }

        [HttpPost]
        public async Task<ActionResult<LeasingCalculatorDTO>> CreateLeasing(LeasingCalculatorDTO leasingDto)
        {
            var vehicle = await _context.Vehicles.FindAsync(leasingDto.VehicleId);
            if (vehicle == null)
            {
                return BadRequest("Invalid VehicleId");
            }

            var leasing = new LeasingCalculator
            {
                ClientName = leasingDto.ClientName,
                VehicleId = leasingDto.VehicleId,
                LeaseTerm = leasingDto.LeaseTerm,
                DownPayment = leasingDto.DownPayment,
                InterestRate = leasingDto.InterestRate,
                MonthlyPayment = leasingDto.MonthlyPayment,
                StartDate = leasingDto.StartDate
            };

            _context.Set<LeasingCalculator>().Add(leasing);
            await _context.SaveChangesAsync();

            leasingDto.Id = leasing.Id;

            return CreatedAtAction(nameof(GetLeasings), new { id = leasing.Id }, leasingDto);
        }
    }
}
