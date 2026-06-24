using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using mundial2026.API.DTOs;
using mundial2026.Business.Security;
using mundial2026.Business.Services;
using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ValidacionController : ControllerBase
{
    private readonly IValidacionService _validacionService;
    private readonly IDispositivoRepository _dispositivoRepository;
    private readonly ILogger<ValidacionController> _logger;

    public ValidacionController(
        IValidacionService validacionService,
        IDispositivoRepository dispositivoRepository,
        ILogger<ValidacionController> logger)
    {
        _validacionService = validacionService;
        _dispositivoRepository = dispositivoRepository;
        _logger = logger;
    }

    [Authorize(Roles = Roles.Funcionario)]
    [HttpPost("escaneo")]
    public Task<IActionResult> Escanear([FromBody] ValidarEntradaRequest request) =>
        ProcesarEscaneoAsync(request);

    [Authorize(Roles = Roles.Funcionario)]
    [HttpGet("historial")]
    public async Task<IActionResult> GetHistorial()
    {
        try
        {
            var email = GetEmailFuncionario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var historial = await _validacionService.GetHistorialAsync(email);
            return Ok(historial.Select(MapHistorial).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener historial de validaciones: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Funcionario)]
    [HttpGet("estadisticas")]
    public async Task<IActionResult> GetEstadisticas()
    {
        try
        {
            var email = GetEmailFuncionario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var total = await _validacionService.GetTotalValidacionesAsync(email);
            var dispositivos = await _dispositivoRepository.GetByFuncionarioAsync(email);

            return Ok(new
            {
                validados = total,
                dispositivos = dispositivos.Select(d => new DispositivoResponse
                {
                    IdDispositivo = d.IdDispositivo,
                    Descripcion = d.Descripcion,
                    EmailFuncionario = d.EmailFuncionario
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener estadísticas: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    internal async Task<IActionResult> ProcesarEscaneoAsync(ValidarEntradaRequest request)
    {
        try
        {
            var email = GetEmailFuncionario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var resultado = await _validacionService.EscanearConDispositivoOpcionalAsync(
                email, request.QrCode, request.IdDispositivo);

            _logger.LogInformation(
                "Validación {Status} por {Email} — entrada {IdEntrada}",
                resultado.Status, email, resultado.IdEntrada);

            return Ok(MapEscaneoResponse(resultado));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al validar entrada: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    private string? GetEmailFuncionario() =>
        User.FindFirstValue(ClaimTypes.Email)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

    internal static ValidacionEscaneoResponse MapEscaneoResponse(ValidacionEscaneoResult r) => new()
    {
        Status = r.Status,
        Title = r.Title,
        Message = r.Message,
        Details = r.Details,
        IdValidacion = r.IdValidacion,
        IdEntrada = r.IdEntrada
    };

    private static ValidacionHistorialResponse MapHistorial(Validacion v) => new()
    {
        IdValidacion = v.IdValidacion,
        Fecha = v.Fecha,
        IdEntrada = v.IdEntrada,
        TokenQr = v.TokenQr,
        IdDispositivo = v.IdDispositivo,
        CodigoSector = v.CodigoSector ?? string.Empty,
        EstadioNombre = v.EstadioNombre ?? string.Empty,
        EquipoLocalNombre = v.EquipoLocalNombre ?? string.Empty,
        EquipoVisitanteNombre = v.EquipoVisitanteNombre ?? string.Empty
    };
}
