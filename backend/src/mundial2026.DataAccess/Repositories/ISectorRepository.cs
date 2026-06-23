using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public interface ISectorRepository
{
    Task<List<Sector>> GetByEstadioIdAsync(int idEstadio);
    Task<Sector?> GetBySectorAsync(int idEstadio, string codigo);
    Task<bool> ExistsBySectorAsync(int idEstadio, string codigo);
    Task CreateAsync(Sector sector);
    Task UpdateAsync(Sector sector);
    Task DeleteAsync(int idEstadio, string codigo);
    Task<int> GetEntradasDisponiblesAsync(int idEstadio, string codigo);
    Task<decimal?> GetCostoAsync(int idEstadio, string codigo);
}
