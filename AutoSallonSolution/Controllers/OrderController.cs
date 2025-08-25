using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoSallonSolution.Data;
using AutoSallonSolution.Models;
using AutoSallonSolution.DTOs;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace AutoSallonSolution.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<OrderController> _logger;

        public OrderController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<OrderController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        // POST: api/Order
        [HttpPost]
        public async Task<ActionResult<OrderResponseDTO>> CreateOrder(CreateOrderDTO createOrderDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return Unauthorized();

                var vehicle = await _context.Vehicles.FindAsync(createOrderDto.VehicleId);
                if (vehicle == null)
                    return NotFound("Vehicle not found");

                var order = new Order
                {
                    UserId = userId,
                    VehicleId = createOrderDto.VehicleId,
                    TotalAmount = vehicle.Price,
                    ShippingAddress = createOrderDto.ShippingAddress,
                    ShippingMethod = createOrderDto.ShippingMethod,
                    UserNotes = createOrderDto.UserNotes,
                    OrderDate = DateTime.UtcNow,
                    Status = "Pending"
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                return await GetOrderResponseDTO(order.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, "An error occurred while creating the order");
            }
        }

        // GET: api/Order
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderResponseDTO>>> GetOrders()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isAdmin = User.IsInRole("Admin");

                var ordersQuery = _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Vehicle)
                    .AsQueryable();

                // If not admin, only show user's orders
                if (!isAdmin)
                {
                    ordersQuery = ordersQuery.Where(o => o.UserId == userId);
                }

                var orders = await ordersQuery.ToListAsync();
                var orderDtos = orders.Select(o => new OrderResponseDTO
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    UserName = o.User.UserName,
                    VehicleId = o.VehicleId,
                    VehicleName = o.Vehicle.Title,
                    VehicleImage = o.Vehicle.Image,
                    TotalAmount = o.TotalAmount,
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    PaymentMethod = o.PaymentMethod,
                    PaymentStatus = o.PaymentStatus,
                    PaymentDate = o.PaymentDate,
                    ShippingAddress = o.ShippingAddress,
                    ShippingMethod = o.ShippingMethod,
                    EstimatedDeliveryDate = o.EstimatedDeliveryDate,
                    AdminNotes = o.AdminNotes,
                    UserNotes = o.UserNotes,
                    AdminActionDate = o.AdminActionDate,
                    AdminActionBy = o.AdminActionBy,
                    IsActive = o.IsActive,
                    CancellationDate = o.CancellationDate,
                    CancellationReason = o.CancellationReason
                }).ToList();

                return Ok(orderDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders");
                return StatusCode(500, "An error occurred while retrieving orders");
            }
        }

        // GET: api/Order/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponseDTO>> GetOrder(int id)
        {
            try
            {
                var orderDto = await GetOrderResponseDTO(id);
                if (orderDto == null)
                    return NotFound();

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isAdmin = User.IsInRole("Admin");

                // Check if user has permission to view this order
                if (!isAdmin && orderDto.UserId != userId)
                    return Forbid();

                return orderDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order {OrderId}", id);
                return StatusCode(500, "An error occurred while retrieving the order");
            }
        }

        // PUT: api/Order/{id}/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, OrderStatusUpdateDTO updateDto)
        {
            try
            {
                var order = await _context.Orders.FindAsync(id);
                if (order == null)
                    return NotFound();

                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var admin = await _userManager.FindByIdAsync(adminId);

                order.Status = updateDto.Status;
                order.AdminNotes = updateDto.Notes;
                order.AdminActionDate = DateTime.UtcNow;
                order.AdminActionBy = admin?.UserName;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status {OrderId}", id);
                return StatusCode(500, "An error occurred while updating the order status");
            }
        }

        // PUT: api/Order/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id, CancelOrderDTO cancelDto)
        {
            try
            {
                var order = await _context.Orders.FindAsync(id);
                if (order == null)
                    return NotFound();

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isAdmin = User.IsInRole("Admin");

                // Only allow cancellation if user owns the order or is admin
                if (!isAdmin && order.UserId != userId)
                    return Forbid();

                // Only allow cancellation of pending orders
                if (order.Status != "Pending")
                    return BadRequest("Can only cancel pending orders");

                order.Status = "Cancelled";
                order.IsActive = false;
                order.CancellationDate = DateTime.UtcNow;
                order.CancellationReason = cancelDto.CancellationReason;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order {OrderId}", id);
                return StatusCode(500, "An error occurred while cancelling the order");
            }
        }

        // GET: api/Order/check/{vehicleId}
        [HttpGet("check/{vehicleId}")]
        public async Task<ActionResult<bool>> HasUserOrderedVehicle(int vehicleId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var hasOrdered = await _context.Orders
                    .AnyAsync(o => o.UserId == userId && o.VehicleId == vehicleId);

                return Ok(hasOrdered);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking user order for vehicle {VehicleId}", vehicleId);
                return StatusCode(500, "An error occurred while checking the order status");
            }
        }

        private async Task<OrderResponseDTO> GetOrderResponseDTO(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Vehicle)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return null;

            return new OrderResponseDTO
            {
                Id = order.Id,
                UserId = order.UserId,
                UserName = order.User.UserName,
                VehicleId = order.VehicleId,
                VehicleName = order.Vehicle.Title,
                VehicleImage = order.Vehicle.Image,
                TotalAmount = order.TotalAmount,
                OrderDate = order.OrderDate,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                PaymentDate = order.PaymentDate,
                ShippingAddress = order.ShippingAddress,
                ShippingMethod = order.ShippingMethod,
                EstimatedDeliveryDate = order.EstimatedDeliveryDate,
                AdminNotes = order.AdminNotes,
                UserNotes = order.UserNotes,
                AdminActionDate = order.AdminActionDate,
                AdminActionBy = order.AdminActionBy,
                IsActive = order.IsActive,
                CancellationDate = order.CancellationDate,
                CancellationReason = order.CancellationReason
            };
        }
    }
} 