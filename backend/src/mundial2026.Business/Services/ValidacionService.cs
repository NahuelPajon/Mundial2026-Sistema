using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class ValidacionService : IValidacionService
{
    private readonly IValidacionRepository _validacionRepository;
    private readonly IDispositivoRepository _dispositivoRepository;
    private readonly IFuncionarioRepository _funcionarioRepository;

    public ValidacionService(
        IValidacionRepository validacionRepository,
        IDispositivoRepository dispositivoRepository,
        IFuncionarioRepository funcionarioRepository)
    {
        _validacionRepository = validacionRepository;
        _dispositivoRepository = dispositivoRepository;
        _funcionarioRepository = funcionarioRepository;
    }

    public async Task<ValidacionEscaneoResult> EscanearAsync(
        string emailFuncionario,
        string token,
        int idDispositivo)
    {
        if (string.IsNullOrWhiteSpace(emailFuncionario))
            throw new ArgumentException("Email de funcionario no puede estar vacío");

        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("El código QR no puede estar vacío");

        if (idDispositivo <= 0)
            throw new ArgumentException("ID de dispositivo inválido");

        if (!await _funcionarioRepository.ExistsByEmailAsync(emailFuncionario))
            throw new KeyNotFoundException($"Funcionario {emailFuncionario} no encontrado");

        try
        {
            var validacion = await _validacionRepository.RegistrarEscaneoAsync(
                token.Trim(), idDispositivo, emailFuncionario);

            return new ValidacionEscaneoResult
            {
                Status = "success",
                Title = "VALIDADO",
                Message = "ACCESO PERMITIDO",
                Details = $"SECTOR {validacion.CodigoSector} | {validacion.EquipoLocalNombre} vs {validacion.EquipoVisitanteNombre} | {validacion.EstadioNombre}",
                IdValidacion = validacion.IdValidacion,
                IdEntrada = validacion.IdEntrada
            };
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("consumida", StringComparison.OrdinalIgnoreCase))
        {
            return new ValidacionEscaneoResult
            {
                Status = "error",
                Title = "ERROR",
                Message = "TICKET YA CONSUMIDO",
                Details = ex.Message
            };
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("expir", StringComparison.OrdinalIgnoreCase))
        {
            return new ValidacionEscaneoResult
            {
                Status = "error",
                Title = "ERROR",
                Message = "QR EXPIRADO",
                Details = "Solicite al titular que renueve el código en la aplicación"
            };
        }
        catch (UnauthorizedAccessException)
        {
            return new ValidacionEscaneoResult
            {
                Status = "error",
                Title = "ERROR",
                Message = "DISPOSITIVO NO AUTORIZADO",
                Details = "El dispositivo no está autorizado para este funcionario"
            };
        }
        catch (KeyNotFoundException)
        {
            return new ValidacionEscaneoResult
            {
                Status = "error",
                Title = "ERROR",
                Message = "QR NO RECONOCIDO",
                Details = "El código escaneado no corresponde a una entrada válida"
            };
        }
    }

    public async Task<ValidacionEscaneoResult> EscanearConDispositivoOpcionalAsync(
        string emailFuncionario,
        string token,
        int? idDispositivo)
    {
        var idResuelto = await ResolverDispositivoAsync(emailFuncionario, idDispositivo);
        if (idResuelto == null)
        {
            throw new ArgumentException(
                "Debe indicar un dispositivo autorizado (idDispositivo) o tener al menos uno asignado");
        }

        return await EscanearAsync(emailFuncionario, token, idResuelto.Value);
    }

    private async Task<int?> ResolverDispositivoAsync(string emailFuncionario, int? idDispositivo)
    {
        if (idDispositivo.HasValue && idDispositivo.Value > 0)
        {
            if (await _dispositivoRepository.PerteneceAFuncionarioAsync(idDispositivo.Value, emailFuncionario))
                return idDispositivo.Value;
            return null;
        }

        var dispositivos = await _dispositivoRepository.GetByFuncionarioAsync(emailFuncionario);
        return dispositivos.Count > 0 ? dispositivos[0].IdDispositivo : null;
    }

    public async Task<List<Validacion>> GetHistorialAsync(string emailFuncionario)
    {
        if (string.IsNullOrWhiteSpace(emailFuncionario))
            throw new ArgumentException("Email de funcionario no puede estar vacío");

        return await _validacionRepository.GetByFuncionarioAsync(emailFuncionario);
    }

    public async Task<int> GetTotalValidacionesAsync(string emailFuncionario)
    {
        if (string.IsNullOrWhiteSpace(emailFuncionario))
            throw new ArgumentException("Email de funcionario no puede estar vacío");

        return await _validacionRepository.CountByFuncionarioAsync(emailFuncionario);
    }
}
