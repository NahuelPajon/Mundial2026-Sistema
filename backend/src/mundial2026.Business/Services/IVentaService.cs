using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public interface IVentaService
{
    Task<Venta> ComprarAsync(string emailUsuario, List<CompraEntradaDto> entradas);
    Task<Venta> GetByIdAsync(int idVenta, string emailUsuario);
    Task<List<Venta>> GetMisComprasAsync(string emailUsuario);
}

public class CompraEntradaDto
{
    public int IdEvento { get; set; }
    public string CodigoSector { get; set; } = string.Empty;
}
