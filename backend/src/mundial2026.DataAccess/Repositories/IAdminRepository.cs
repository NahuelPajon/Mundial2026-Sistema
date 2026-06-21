using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IAdminRepository
{
    Task<Admin?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task CreateAsync(Admin admin, Npgsql.NpgsqlConnection connection, Npgsql.NpgsqlTransaction transaction);
}
