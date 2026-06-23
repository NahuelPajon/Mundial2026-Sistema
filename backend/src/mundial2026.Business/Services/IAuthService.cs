namespace mundial2026.Business.Services;

public interface IAuthService
{
    Task<AuthUserDto> LoginAsync(string email, string password);
    Task RegisterAsync(RegisterProfileDto dto);
    Task<AuthUserDto> GetCurrentUserAsync(string email);
}
