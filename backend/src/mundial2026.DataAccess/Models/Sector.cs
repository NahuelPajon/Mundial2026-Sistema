namespace mundial2026.DataAccess.Models;

public class Sector
{
    public int IdEstadio { get; set; }
    public string Codigo { get; set; } = string.Empty; // A, B, C, D
    public int CapacidadMaxima { get; set; }
    public decimal Costo { get; set; }
    
    // Adicional para consultas
    public int EntradasDisponibles { get; set; }
}
