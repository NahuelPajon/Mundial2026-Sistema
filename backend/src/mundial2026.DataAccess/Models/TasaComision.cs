namespace mundial2026.DataAccess.Models;

public class TasaComision
{
    public int IdTasa { get; set; }
    public decimal Porcentaje { get; set; }
    public DateTime FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}
