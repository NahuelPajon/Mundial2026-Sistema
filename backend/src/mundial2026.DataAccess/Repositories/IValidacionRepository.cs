using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IValidacionRepository
{
    Task<Validacion?> GetByIdAsync(int idValidacion);
    Task<List<Validacion>> GetByFuncionarioAsync(string emailFuncionario);
    Task<int> CountByFuncionarioAsync(string emailFuncionario);
    Task<Validacion> RegistrarEscaneoAsync(string token, int idDispositivo, string emailFuncionario);
}
