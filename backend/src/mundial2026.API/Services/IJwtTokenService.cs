namespace mundial2026.API.Services;

public interface IJwtTokenService
{
    string GenerateToken(string email, string rol);
}
