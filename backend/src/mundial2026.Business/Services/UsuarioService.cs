using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
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

    public async Task RegisterAsync(string email, string paisDir, string localidad, string calle,
                                    string numeroDir, string codPostal, string docPais, string docTipo,
                                    string docNumero, List<string> telefonos)
    {
        // Validaciones
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email no puede estar vacío");

        if (await _usuarioRepository.ExistsByEmailAsync(email))
            throw new InvalidOperationException($"El email {email} ya está registrado");

        var usuario = new Usuario
        {
            Email = email,
            PaisDir = paisDir,
            Localidad = localidad,
            Calle = calle,
            NumeroDir = numeroDir,
            CodPostal = codPostal,
            DocPais = docPais,
            DocTipo = docTipo,
            DocNumero = docNumero,
            Telefonos = telefonos ?? new(),
            FechaRegistro = DateTime.UtcNow,
            EstadoVerificacion = "pendiente"
        };

        await _usuarioRepository.CreateAsync(usuario);
    }
}
