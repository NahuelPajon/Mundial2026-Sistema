using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class PerfilService : IPerfilService
{
    private readonly IPerfilRepository _perfilRepository;

    public PerfilService(IPerfilRepository perfilRepository)
    {
        _perfilRepository = perfilRepository;
    }

    public async Task<dynamic> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email no puede estar vacío");

        var perfil = await _perfilRepository.GetByEmailAsync(email);
        if (perfil == null)
            throw new KeyNotFoundException($"Perfil con email {email} no encontrado");

        return perfil;
    }

    public async Task CreateAsync(string email, string paisDir, string localidad, string calle,
                                   string numeroDir, string codPostal, string docPais, string docTipo,
                                   string docNumero, List<string> telefonos)
    {
        // Validaciones
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email no puede estar vacío");

        if (await _perfilRepository.ExistsByEmailAsync(email))
            throw new InvalidOperationException($"El email {email} ya está registrado");

        if (await _perfilRepository.ExistsByDocumentoAsync(docPais, docTipo, docNumero))
            throw new InvalidOperationException("El documento ya está registrado");

        var perfil = new Perfil
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
            Telefonos = telefonos ?? new()
        };

        await _perfilRepository.CreateAsync(perfil);
    }
}
