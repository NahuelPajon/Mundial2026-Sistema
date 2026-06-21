namespace mundial2026.API.DTOs;

public class CreateEstadioRequest
{
    public string Nombre { get; set; } = string.Empty;
    public int Aforo { get; set; }
    public string PaisDir { get; set; } = string.Empty;
    public string Localidad { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public string NumeroDir { get; set; } = string.Empty;
    public List<SectorRequest> Sectores { get; set; } = new();
}

public class SectorRequest
{
    public string Codigo { get; set; } = string.Empty;
    public int CapacidadMaxima { get; set; }
    public decimal Costo { get; set; }
}
