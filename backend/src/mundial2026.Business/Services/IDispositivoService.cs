using mundial2026.DataAccess.Models;

namespace mundial2026.Business.Services;

public interface IDispositivoService
{
    Task<List<Dispositivo>> GetAllAsync();
    Task<List<Dispositivo>> GetMisDispositivosAsync(string emailFuncionario);
    Task<Dispositivo> CreateAsync(string descripcion, string emailFuncionario);
    Task<bool> DeleteAsync(int idDispositivo);
}
