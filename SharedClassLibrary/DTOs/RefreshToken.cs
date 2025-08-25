using System;
using System.ComponentModel.DataAnnotations;

namespace SharedClassLibrary.DTOs
{
  public class RefreshToken
  {
    [Key]
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime Created { get; set; } = DateTime.Now;
    public DateTime Expired { get; set; }
    public string UserId { get; set; } = string.Empty;
  }
}
