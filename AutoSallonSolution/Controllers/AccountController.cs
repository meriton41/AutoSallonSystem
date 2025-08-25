using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedClassLibrary.Contracts;
using SharedClassLibrary.DTOs;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;
using AutoSallonSolution.Data;
using System.Net;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace AutoSallonSolution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IUserAccount userAccount;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AccountController(IUserAccount userAccount, ApplicationDbContext context, IConfiguration config, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            this.userAccount = userAccount;
            _context = context;
            _config = config;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserDTO userDTO)
        {
            try
            {
                if (userDTO == null)
                {
                    return BadRequest(new { message = "Invalid registration data" });
                }

                if (string.IsNullOrWhiteSpace(userDTO.UserName))
                {
                    return BadRequest(new { message = "UserName is required" });
                }

                if (string.IsNullOrWhiteSpace(userDTO.Email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                if (string.IsNullOrWhiteSpace(userDTO.Password))
                {
                    return BadRequest(new { message = "Password is required" });
                }

                if (userDTO.Password != userDTO.ConfirmPassword)
                {
                    return BadRequest(new { message = "Passwords do not match" });
                }

                var response = await userAccount.CreateAccount(userDTO);

                if (!response.Flag)
                {
                    return BadRequest(response);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration. Please try again later." });
            }
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Verification token is missing" });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailConfirmationToken == token);
            if (user == null)
            {
                return BadRequest(new { message = "Invalid verification token" });
            }

            if (user.IsEmailConfirmed)
            {
                return BadRequest(new { message = "Email is already verified" });
            }

            user.IsEmailConfirmed = true;
            user.EmailConfirmationToken = null;
            user.EmailConfirmationTokenCreatedAt = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Email verified successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            var response = await userAccount.LoginAccount(loginDTO);
            if (!response.Flag)
            {
                return Unauthorized(response);
            }

            // Generate refresh token and set cookie
            var refreshToken = GenerateRefreshToken();
            SetRefreshToken(refreshToken);

            // Store refresh token in database
            // Note: LoginResponse does not have UserId, get userId from userAccount or loginDTO
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDTO.Email);
            if (user != null)
            {
                await userAccount.StoreRefreshToken(user.Id, refreshToken);
            }

            return Ok(new { token = response.Token });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            {
                return Unauthorized(new { message = "Refresh token is missing" });
            }

            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized(new { message = "Authorization header is missing or invalid" });
            }
            var token = authHeader.Replace("Bearer ", "");

            var principal = GetPrincipalFromExpiredToken(token);
            if (principal == null)
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid token claims" });
            }

            var isValid = await userAccount.ValidateRefreshToken(refreshToken, userId);
            if (!isValid)
            {
                return Unauthorized(new { message = "Invalid refresh token" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var userRole = (await userAccount.GetUsers()).Find(u => u.Id == userId)?.Role ?? "User";
            var newToken = userAccount.GenerateToken(new UserSession(user.Id, user.UserName, user.Email, userRole));

            // Generate new refresh token and set cookie
            var newRefreshToken = GenerateRefreshToken();
            SetRefreshToken(newRefreshToken);
            await userAccount.StoreRefreshToken(userId, newRefreshToken);

            return Ok(new { token = newToken });
        }

        private RefreshToken GenerateRefreshToken()
        {
            return new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                Expired = DateTime.Now.AddDays(7),
                Created = DateTime.Now
            };
        }

        private void SetRefreshToken(RefreshToken newRefreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = newRefreshToken.Expired
            };
            Response.Cookies.Append("refreshToken", newRefreshToken.Token, cookieOptions);
        }

        private System.Security.Claims.ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_config["Jwt:Key"])),
                ValidateLifetime = false, // We want to get claims from expired token
                ValidIssuer = _config["Jwt:Issuer"],
                ValidAudience = _config["Jwt:Audience"]
            };

            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
                if (securityToken is System.IdentityModel.Tokens.Jwt.JwtSecurityToken jwtSecurityToken &&
                    jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return principal;
                }
            }
            catch
            {
                return null;
            }
            return null;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new { user.Id, user.UserName, user.Email, Roles = roles });
            }
            return Ok(userList);
        }

            [HttpPost("users/{userId}/role")]
            public async Task<IActionResult> UpdateUserRole(string userId, [FromBody] string role)
        {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { message = "User not found" });
                if (!await _roleManager.RoleExistsAsync(role))
                    return BadRequest(new { message = "Role does not exist" });
                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, role);
                return Ok(new { message = "User role updated successfully" });
            }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUserProfile()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var userProfile = new UserProfileDto
            {
                UserName = user.UserName,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };

            return Ok(userProfile);
        }

        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUserDetails(string userId, [FromBody] UserDetailsDTO userDetailsDTO)
        {
            var response = await userAccount.UpdateUser(userId, userDetailsDTO);
            if (!response.Flag)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpDelete("users/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            try
            {
                Console.WriteLine($"Attempting to delete user with ID: {userId}");
                Console.WriteLine($"Request Method: {Request.Method}");
                Console.WriteLine($"Request Headers: {string.Join(", ", Request.Headers.Select(h => $"{h.Key}: {h.Value}"))}");
                
                // Add user role check logging
                var currentUser = await _userManager.GetUserAsync(User);
                if (currentUser != null)
                {
                    var roles = await _userManager.GetRolesAsync(currentUser);
                    Console.WriteLine($"Current user roles: {string.Join(", ", roles)}");
                }
                else
                {
                    Console.WriteLine("Current user is null");
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    Console.WriteLine($"User not found with ID: {userId}");
                    return NotFound(new { message = "User not found" });
                }

                // Check if trying to delete self
                if (user.Id == currentUser.Id)
                {
                    return BadRequest(new { message = "Cannot delete your own account" });
                }

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    Console.WriteLine($"Failed to delete user: {errors}");
                    return BadRequest(new { message = "Failed to delete user", errors = errors });
                }

                Console.WriteLine($"Successfully deleted user with ID: {userId}");
                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting user: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    message = "An error occurred while deleting the user",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpOptions("users/{userId}")]
        public IActionResult Options()
        {
            Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
            Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            return Ok();
        }

        [HttpPost("users/{id}/revoke-token")]
        [Authorize(Roles = "Admin")]
        [EnableCors("AllowReactApp")]
        public async Task<IActionResult> RevokeToken(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Remove all refresh tokens for this user
                var refreshTokens = await _context.RefreshTokens
                    .Where(rt => rt.UserId == id)
                    .ToListAsync();

                _context.RefreshTokens.RemoveRange(refreshTokens);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Token revoked successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while revoking the token" });
            }
        }

        [HttpOptions("users/{id}/revoke-token")]
        [EnableCors("AllowReactApp")]
        public IActionResult RevokeTokenOptions()
        {
            Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
            Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            return Ok();
        }
    }
}

