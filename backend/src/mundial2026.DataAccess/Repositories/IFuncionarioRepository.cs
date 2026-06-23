using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public interface IFuncionarioRepository
{
    Task<Funcionario?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task<bool> ExistsByLegajoAsync(string nroLegajo);
    Task CreateAsync(Funcionario funcionario, NpgsqlConnection connection, NpgsqlTransaction transaction);
}
