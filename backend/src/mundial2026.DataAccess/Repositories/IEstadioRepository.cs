using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IEstadioRepository
{
    Task<Estadio?> GetByIdAsync(int idEstadio);
    Task<List<Estadio>> GetAllAsync();
    Task<bool> ExistsByIdAsync(int idEstadio);
    Task<int> CreateAsync(Estadio estadio);
    Task UpdateAsync(Estadio estadio);
}
