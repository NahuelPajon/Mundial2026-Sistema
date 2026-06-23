using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IEntradaRepository
{
    Task<EntradaResumen?> GetResumenByIdAsync(int idEntrada);
    Task<Entrada?> GetDetalleByIdAsync(int idEntrada);
    Task<List<Entrada>> GetActivasByTitularAsync(string emailTitular);
    Task<bool> ExistsByIdAsync(int idEntrada);
    Task<bool> IsTitularAsync(int idEntrada, string emailTitular);
}
