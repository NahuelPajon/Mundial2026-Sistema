using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IEquipoRepository
{
    Task<Equipo?> GetByIdAsync(int idEquipo);
    Task<List<Equipo>> GetAllAsync();
    Task<bool> ExistsByIdAsync(int idEquipo);
    Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null);
    Task<bool> IsUsedInEventoAsync(int idEquipo);
    Task<int> CreateAsync(Equipo equipo);
    Task UpdateAsync(Equipo equipo);
    Task DeleteAsync(int idEquipo);
}
