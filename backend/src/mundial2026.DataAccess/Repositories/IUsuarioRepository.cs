using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task CreateAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
}
