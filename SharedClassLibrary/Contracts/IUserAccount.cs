using SharedClassLibrary.DTOs;


namespace SharedClassLibrary.Contracts
{
    public interface IUserAccount
    {
        Task<ServiceResponses.RegisterResponse> CreateAccount(UserDTO userDTO);
        Task<ServiceResponses.LoginResponse> LoginAccount(LoginDTO loginDTO);
        Task<List<UserDetailsDTO>> GetUsers();
        Task<ServiceResponses.GeneralResponse> UpdateUser(string id, UserDetailsDTO userDetailsDTO);
        Task StoreRefreshToken(string userId, RefreshToken refreshToken);
        Task<bool> ValidateRefreshToken(string token, string userId);
        string GenerateToken(UserSession user);
    }
}