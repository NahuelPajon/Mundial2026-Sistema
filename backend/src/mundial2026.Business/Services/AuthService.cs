using mundial2026.Business.Security;
using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly IPerfilRepository _perfilRepository;
    private readonly IFuncionarioRepository _funcionarioRepository;

    public AuthService(
        IAuthRepository authRepository,
        IPerfilRepository perfilRepository,
        IFuncionarioRepository funcionarioRepository)
    {
        _authRepository = authRepository;
        _perfilRepository = perfilRepository;
        _funcionarioRepository = funcionarioRepository;
    }

    public async Task<AuthUserDto> LoginAsync(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email no puede estar vacío");

        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Contraseña no puede estar vacía");

        if (!await _authRepository.ValidateCredentialsAsync(email, password))
            throw new UnauthorizedAccessException("Credenciales inválidas");

        var rol = await _authRepository.GetRolAsync(email);
        if (rol == null)
            throw new UnauthorizedAccessException("Perfil sin rol asignado");

        return new AuthUserDto { Email = email, Rol = rol };
    }

    public async Task RegisterAsync(RegisterProfileDto dto)
    {
        if (!Roles.IsValid(dto.Rol))
            throw new ArgumentException($"Rol inválido. Valores permitidos: {string.Join(", ", Roles.All)}");

        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new ArgumentException("Email no puede estar vacío");

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
            throw new ArgumentException("La contraseña debe tener al menos 8 caracteres");

        if (await _perfilRepository.ExistsByEmailAsync(dto.Email))
            throw new InvalidOperationException($"El email {dto.Email} ya está registrado");

        if (await _perfilRepository.ExistsByDocumentoAsync(dto.DocPais, dto.DocTipo, dto.DocNumero))
            throw new InvalidOperationException("Ya existe un perfil con ese documento");

        var perfil = new Perfil
        {
            Email = dto.Email,
            PaisDir = dto.PaisDir,
            Localidad = dto.Localidad,
            Calle = dto.Calle,
            NumeroDir = dto.NumeroDir,
            CodPostal = dto.CodPostal,
            DocPais = dto.DocPais,
            DocTipo = dto.DocTipo,
            DocNumero = dto.DocNumero,
            Telefonos = dto.Telefonos ?? new(),
            PasswordHash = dto.Password
        };

        var rol = Roles.Normalize(dto.Rol);

        switch (rol)
        {
            case Roles.Usuario:
                await _authRepository.RegisterUsuarioAsync(perfil, DateTime.UtcNow, "pendiente");
                break;
            case Roles.Admin:
                if (dto.FechaAsignacion == null)
                    throw new ArgumentException("FechaAsignacion es obligatoria para Admin");
                await _authRepository.RegisterAdminAsync(perfil, dto.FechaAsignacion.Value);
                break;
            case Roles.Funcionario:
                if (string.IsNullOrWhiteSpace(dto.NroLegajo))
                    throw new ArgumentException("NroLegajo es obligatorio para Funcionario");
                if (await _funcionarioRepository.ExistsByLegajoAsync(dto.NroLegajo))
                    throw new InvalidOperationException($"El legajo {dto.NroLegajo} ya está registrado");
                await _authRepository.RegisterFuncionarioAsync(perfil, dto.NroLegajo);
                break;
        }
    }

    public async Task<AuthUserDto> GetCurrentUserAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email no puede estar vacío");

        if (!await _perfilRepository.ExistsByEmailAsync(email))
            throw new KeyNotFoundException($"Perfil con email {email} no encontrado");

        var rol = await _authRepository.GetRolAsync(email);
        if (rol == null)
            throw new KeyNotFoundException($"No se encontró rol para {email}");

        return new AuthUserDto { Email = email, Rol = rol };
    }
}
