using System;
using System.Collections.Generic;

namespace AutoSallonSolution.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; }
    }
} 