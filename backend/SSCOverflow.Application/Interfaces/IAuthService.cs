using SSCOverflow.Application.DTOs;

namespace SSCOverflow.Application.Interfaces
{
    public interface IAuthService
    {
        Task<string> LoginAsync(LoginDto loginDto);
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileDto updateProfileDto);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    }
} 