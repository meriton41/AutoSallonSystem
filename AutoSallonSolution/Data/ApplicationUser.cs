using Microsoft.AspNetCore.Identity;

namespace AutoSallonSolution.Data
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
        public bool IsEmailConfirmed { get; set; } = false;

        public string? EmailConfirmationToken { get; set; }
        public DateTime? EmailConfirmationTokenCreatedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public ApplicationUser()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
}
