namespace SharedClassLibrary.DTOs
{
    using Microsoft.AspNetCore.Identity;

    public class ServiceResponses
    {
        public record class GeneralResponse(bool Flag, string Message);
        public record class LoginResponse(bool Flag, string Token, string Message);
        public record class RegisterResponse(bool Flag, string Message, IdentityUser? User);
    }
}