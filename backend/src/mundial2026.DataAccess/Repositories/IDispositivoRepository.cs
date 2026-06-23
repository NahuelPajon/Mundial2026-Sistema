using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public interface IDispositivoRepository
{
    Task<Dispositivo?> GetByIdAsync(int idDispositivo);
    Task<List<Dispositivo>> GetAllAsync();
    Task<List<Dispositivo>> GetByFuncionarioAsync(string emailFuncionario);
    Task<bool> PerteneceAFuncionarioAsync(int idDispositivo, string emailFuncionario);
    Task<int> CreateAsync(string descripcion, string emailFuncionario);
    Task<bool> DeleteAsync(int idDispositivo);
}
