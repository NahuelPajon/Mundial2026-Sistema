using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public class CompraEntradaItem
{
    public int IdEvento { get; set; }
    public int IdEstadio { get; set; }
    public string CodigoSector { get; set; } = string.Empty;
    public decimal Costo { get; set; }
}

public interface IVentaRepository
{
    Task<Venta?> GetByIdAsync(int idVenta);
    Task<List<Venta>> GetByUsuarioAsync(string emailUsuario);
    Task<Venta> CreateWithEntradasAsync(
        string emailUsuario,
        int idTasa,
        decimal porcentajeComision,
        decimal montoTotal,
        decimal subtotal,
        IReadOnlyList<CompraEntradaItem> items);
}
