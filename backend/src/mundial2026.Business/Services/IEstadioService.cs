using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public interface IEstadioService
{
    Task<Estadio> GetByIdAsync(int idEstadio);
    Task<List<Estadio>> GetAllAsync();
    Task<int> CreateAsync(string emailAdmin, string nombre, int aforo, string paisDir, string localidad,
                          string calle, string numeroDir, List<SectorCreationDto> sectores);
    Task<List<Sector>> GetSectoresAsync(int idEstadio);
    Task UpdateSectorPrecioAsync(string emailAdmin, int idEstadio, string codigoSector, decimal nuevoPrecio);
}