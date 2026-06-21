namespace mundial2026.API.Services;

public class JwtSettings
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "mundial2026";
    public string Audience { get; set; } = "mundial2026";
    public int ExpirationMinutes { get; set; } = 60;
}
