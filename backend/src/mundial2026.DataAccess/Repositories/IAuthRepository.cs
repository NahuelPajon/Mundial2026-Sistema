using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public interface IAuthRepository
{
    Task<bool> ValidateCredentialsAsync(string email, string password);
    Task<string?> GetRolAsync(string email);
    Task RegisterUsuarioAsync(Perfil perfil, DateTime fechaRegistro, string estadoVerificacion);
    Task RegisterAdminAsync(Perfil perfil, DateTime fechaAsignacion);
    Task RegisterFuncionarioAsync(Perfil perfil, string nroLegajo);
}
