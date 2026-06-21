using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public interface IEquipoService
{
    Task<Equipo> GetByIdAsync(int idEquipo);
    Task<List<Equipo>> GetAllAsync();
    Task<int> CreateAsync(string nombre, string pais);
    Task UpdateAsync(int idEquipo, string nombre, string pais);
    Task DeleteAsync(int idEquipo);
}
