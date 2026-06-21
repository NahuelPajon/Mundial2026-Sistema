namespace mundial2026.API.DTOs;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Rol { get; set; } = "Usuario";
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PaisDir { get; set; } = string.Empty;
    public string Localidad { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public string NumeroDir { get; set; } = string.Empty;
    public string CodPostal { get; set; } = string.Empty;
    public string DocPais { get; set; } = string.Empty;
    public string DocTipo { get; set; } = string.Empty;
    public string DocNumero { get; set; } = string.Empty;
    public List<string> Telefonos { get; set; } = new();
    public DateTime? FechaAsignacion { get; set; }
    public string? NroLegajo { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime ExpiraEn { get; set; }
}

public class MeResponse
{
    public string Email { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
}
