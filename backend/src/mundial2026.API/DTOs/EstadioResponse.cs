namespace mundial2026.API.DTOs;

public class EstadioResponse
{
    public int IdEstadio { get; set; }
    public string Nombre { get; set; }
    public int Aforo { get; set; }
    public string PaisDir { get; set; }
    public string Localidad { get; set; }
    public string Calle { get; set; }
    public string NumeroDir { get; set; }
    public List<SectorResponse> Sectores { get; set; } = new();
}

public class SectorResponse
{
    public string Codigo { get; set; }
    public int CapacidadMaxima { get; set; }
    public decimal Costo { get; set; }
    public int EntradasDisponibles { get; set; }
}

// DTO nuevo para actualizar precio de sector
public class UpdateSectorPrecioRequest
{
    public decimal PrecioBase { get; set; }
}