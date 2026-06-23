using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using mundial2026.API.DTOs;
using mundial2026.Business.Security;
using mundial2026.Business.Services;
using mundial2026.DataAccess.Models;

namespace mundial2026.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Usuario)]
public class TransferenciasController : ControllerBase
{
    private readonly ITransferenciaService _transferenciaService;
    private readonly ILogger<TransferenciasController> _logger;

    public TransferenciasController(
        ITransferenciaService transferenciaService,
        ILogger<TransferenciasController> logger)
    {
        _transferenciaService = transferenciaService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetMisTransferencias([FromQuery] string? tipo = "todas")
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var transferencias = await _transferenciaService.GetByUsuarioAsync(email, tipo);
            return Ok(transferencias.Select(MapResponse).ToList());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al listar transferencias: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var transferencia = await _transferenciaService.GetByIdAsync(id, email);
            return Ok(MapResponse(transferencia));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener transferencia: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Solicitar([FromBody] SolicitarTransferenciaRequest request)
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var transferencia = await _transferenciaService.SolicitarAsync(
                email, request.IdEntrada, request.EmailDestino);

            return CreatedAtAction(nameof(GetById), new { id = transferencia.IdTransferencia },
                MapResponse(transferencia));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al solicitar transferencia: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpPost("{id}/aceptar")]
    public async Task<IActionResult> Aceptar(int id)
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var transferencia = await _transferenciaService.AceptarAsync(email, id);
            return Ok(new { mensaje = "Transferencia aceptada", transferencia = MapResponse(transferencia) });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al aceptar transferencia: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpPost("{id}/rechazar")]
    public async Task<IActionResult> Rechazar(int id)
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var transferencia = await _transferenciaService.RechazarAsync(email, id);
            return Ok(new { mensaje = "Transferencia rechazada", transferencia = MapResponse(transferencia) });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al rechazar transferencia: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    private string? GetEmailUsuario() =>
        User.FindFirstValue(ClaimTypes.Email)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

    private static TransferenciaResponse MapResponse(Transferencia t) => new()
    {
        IdTransferencia = t.IdTransferencia,
        IdEntrada = t.IdEntrada,
        EmailOrigen = t.EmailOrigen,
        EmailDestino = t.EmailDestino,
        FechaSolicitud = t.FechaSolicitud,
        FechaAceptacion = t.FechaAceptacion,
        Estado = t.Estado,
        OrdenHistorial = t.OrdenHistorial,
        EquipoLocalNombre = t.EquipoLocalNombre ?? string.Empty,
        EquipoVisitanteNombre = t.EquipoVisitanteNombre ?? string.Empty,
        EventoFecha = t.EventoFecha ?? default,
        EstadioNombre = t.EstadioNombre ?? string.Empty,
        CodigoSector = t.CodigoSector ?? string.Empty
    };
}
