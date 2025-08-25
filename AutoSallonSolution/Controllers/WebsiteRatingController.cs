using AutoSallonSolution.Data;
using AutoSallonSolution.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using AutoSallonSolution.DTOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]

public class WebsiteRatingsController : ControllerBase
{
    private readonly IMongoCollection<WebsiteRating> _ratingsCollection;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<WebsiteRatingsController> _logger;

    public WebsiteRatingsController(
        MongoDbService mongoDbService,
        UserManager<ApplicationUser> userManager,
        ILogger<WebsiteRatingsController> logger)
    {
        _ratingsCollection = mongoDbService.Database?.GetCollection<WebsiteRating>("WebsiteRatings");
        _userManager = userManager;
        _logger = logger;
    }

    // POST: api/WebsiteRatings
    [Authorize(Roles = "User")]
    [HttpPost]
    public async Task<IActionResult> SubmitRating([FromBody] RatingSubmissionDTO dto)
    {
        try
        {
            _logger.LogInformation("SubmitRating called with value: {Value}, comment: {Comment}", dto.Value, dto.Comment);

            if (dto.Value < 1 || dto.Value > 5)
                return BadRequest(new { message = "Rating must be between 1 and 5" });

            var user = await _userManager.GetUserAsync(User);
            if (user == null) 
            {
                _logger.LogWarning("Unauthorized rating submission attempt");
                return Unauthorized(new { message = "Unauthorized" });
            }

            // Check if user already submitted a rating
            var existingRating = await _ratingsCollection
                .Find(r => r.UserId == user.Id)
                .FirstOrDefaultAsync();

            if (existingRating != null)
            {
                _logger.LogWarning("User {UserId} attempted to submit multiple ratings", user.Id);
                return BadRequest(new { message = "You have already submitted a rating" });
            }

            var rating = new WebsiteRating
            {
                Value = dto.Value,
                Comment = dto.Comment,
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _ratingsCollection.InsertOneAsync(rating);
            _logger.LogInformation("Rating submitted successfully for user {UserId}", user.Id);
            return Ok(rating);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting rating");
            return StatusCode(500, new { message = "An error occurred while submitting your rating" });
        }
    }


    // GET: api/WebsiteRatings
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllRatings()
    {
        try
        {
            var ratings = await _ratingsCollection.Find(_ => true).ToListAsync();
            return Ok(ratings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all ratings");
            return StatusCode(500, new { message = "An error occurred while retrieving ratings" });
        }
    }

    // GET: api/WebsiteRatings/{id}
    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult<WebsiteRating>> GetRating(string id)
    {
        try
        {
            var rating = await _ratingsCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            return rating == null ? NotFound(new { message = "Rating not found" }) : Ok(rating);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting rating with ID {RatingId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the rating" });
        }
    }

    // PUT: api/WebsiteRatings/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRating(string id, [FromBody] WebsiteRating updatedRating)
    {
        try
        {
            var existingRating = await _ratingsCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (existingRating == null)
            {
                _logger.LogWarning("Rating with ID {RatingId} not found for update", id);
                return NotFound(new { message = "Rating not found" });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                _logger.LogWarning("User not found for rating update");
                return Unauthorized(new { message = "Unauthorized" });
            }

            // Check if user is admin or the rating owner
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin && user.Id != existingRating.UserId)
            {
                _logger.LogWarning("User {UserId} not authorized to update rating {RatingId}", user.Id, id);
                return Forbid(new { message = "Forbidden" });
            }

            updatedRating.Id = id;
            updatedRating.UserId = existingRating.UserId;
            updatedRating.CreatedAt = existingRating.CreatedAt;

            await _ratingsCollection.ReplaceOneAsync(r => r.Id == id, updatedRating);

            _logger.LogInformation("Rating {RatingId} updated successfully", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating rating with ID {RatingId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the rating" });
        }
    }

    private IActionResult Forbid(object value)
    {
        throw new NotImplementedException();
    }

    // DELETE: api/WebsiteRatings/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRating(string id)
    {
        try
        {
            var rating = await _ratingsCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (rating == null)
            {
                _logger.LogWarning("Rating with ID {RatingId} not found for deletion", id);
                return NotFound(new { message = "Rating not found" });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                _logger.LogWarning("User not found for rating deletion");
                return Unauthorized(new { message = "Unauthorized" });
            }

            // Check if user is admin or the rating owner
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin && user.Id != rating.UserId)
            {
                _logger.LogWarning("User {UserId} not authorized to delete rating {RatingId}", user.Id, id);
                return Forbid(new { message = "Forbidden" });
            }

            await _ratingsCollection.DeleteOneAsync(r => r.Id == id);

            _logger.LogInformation("Rating {RatingId} deleted successfully", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting rating with ID {RatingId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the rating" });
        }
    }
    // Add this new endpoint to your WebsiteRatingsController
    [HttpGet("hasRated")]
    public async Task<IActionResult> HasUserRated()
    {
        try
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized(new { message = "Unauthorized" });

            var existingRating = await _ratingsCollection
                .Find(r => r.UserId == user.Id)
                .FirstOrDefaultAsync();

            return Ok(new { hasRated = existingRating != null });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user has rated");
            return StatusCode(500, new { message = "An error occurred while checking rating status" });
        }
    }


}
