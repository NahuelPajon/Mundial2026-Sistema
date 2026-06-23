namespace mundial2026.DataAccess.Models;

public class Venta
{
    public int IdVenta { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = string.Empty;
    public decimal MontoTotal { get; set; }
    public int CantidadComprada { get; set; }
    public string EmailUsuario { get; set; } = string.Empty;
    public int IdTasa { get; set; }
    public decimal PorcentajeComision { get; set; }
    public List<Entrada> Entradas { get; set; } = new();
}
