using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IEntradaRepository
{
    Task<EntradaResumen?> GetResumenByIdAsync(int idEntrada);
    Task<bool> ExistsByIdAsync(int idEntrada);
}
