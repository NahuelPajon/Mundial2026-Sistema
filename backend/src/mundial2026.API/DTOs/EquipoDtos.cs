namespace mundial2026.API.DTOs;

public class EquipoResponse
{
    public int IdEquipo { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Pais { get; set; } = string.Empty;
}

public class CreateEquipoRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Pais { get; set; } = string.Empty;
}

public class UpdateEquipoRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Pais { get; set; } = string.Empty;
}
