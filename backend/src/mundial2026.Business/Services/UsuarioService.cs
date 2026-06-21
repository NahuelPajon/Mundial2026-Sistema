using mundial2026.Business.Security;
using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IAuthService _authService;

    public UsuarioService(IUsuarioRepository usuarioRepository, IAuthService authService)
    {
        _usuarioRepository = usuarioRepository;
        _authService = authService;
    }

    public async Task<dynamic> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email no puede estar vacío");

        var usuario = await _usuarioRepository.GetByEmailAsync(email);
        if (usuario == null)
            throw new KeyNotFoundException($"Usuario con email {email} no encontrado");

        return usuario;
    }

    public async Task RegisterAsync(string email, string password, string paisDir, string localidad, string calle,
                                    string numeroDir, string codPostal, string docPais, string docTipo,
                                    string docNumero, List<string> telefonos)
    {
        await _authService.RegisterAsync(new RegisterProfileDto
        {
            Rol = Roles.Usuario,
            Email = email,
            Password = password,
            PaisDir = paisDir,
            Localidad = localidad,
            Calle = calle,
            NumeroDir = numeroDir,
            CodPostal = codPostal,
            DocPais = docPais,
            DocTipo = docTipo,
            DocNumero = docNumero,
            Telefonos = telefonos ?? new()
        });
    }
}
