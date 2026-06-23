using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface ITasaComisionRepository
{
    Task<TasaComision?> GetVigenteAsync(DateTime fecha);
}
