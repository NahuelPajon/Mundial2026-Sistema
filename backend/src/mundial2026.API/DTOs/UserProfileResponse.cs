namespace mundial2026.API.DTOs;

public class UserProfileResponse
{
    public string Email { get; set; }
    public string PaisDir { get; set; }
    public string Localidad { get; set; }
    public string Calle { get; set; }
    public string NumeroDir { get; set; }
    public string CodPostal { get; set; }
    public string DocPais { get; set; }
    public string DocTipo { get; set; }
    public string DocNumero { get; set; }
    public List<string> Telefonos { get; set; }
    public DateTime? FechaRegistro { get; set; }
    public string EstadoVerificacion { get; set; }
}
