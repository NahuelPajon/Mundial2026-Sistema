namespace mundial2026.Business.Services;

public class AuthUserDto
{
    public string Email { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
}

public class RegisterProfileDto
{
    public string Rol { get; set; } = string.Empty;
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
