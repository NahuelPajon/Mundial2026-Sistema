using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IEventoRepository
{
    Task<Evento?> GetByIdAsync(int idEvento);
    Task<List<Evento>> GetAllAsync(int? idEstadio = null);
    Task<bool> ExistsByIdAsync(int idEvento);
    Task<bool> HasOverlappingEventAsync(int idEstadio, DateTime fecha, int? excludeEventoId = null);
    Task<bool> AllSectoresExistInEstadioAsync(int idEstadio, IReadOnlyList<string> codigosSectores);
    Task<int> CreateAsync(Evento evento, IReadOnlyList<string> codigosSectores);
    Task<(int IdEstadio, string Estado)?> GetEstadioInfoAsync(int idEvento);
    Task<bool> IsSectorHabilitadoAsync(int idEvento, int idEstadio, string codigoSector);
}
