using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IPerfilRepository
{
    Task<Perfil?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task<bool> ExistsByDocumentoAsync(string pais, string tipo, string numero);
    Task CreateAsync(Perfil perfil);
    Task UpdateAsync(Perfil perfil);
    Task AddTelefonoAsync(string email, string telefono);
    Task RemoveTelefonoAsync(string email, string telefono);
}
