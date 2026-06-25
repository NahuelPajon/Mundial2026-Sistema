using System.Globalization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using mundial2026.API.DTOs;
using mundial2026.Business.Security;
using mundial2026.Business.Services;
using mundial2026.DataAccess.Models;

namespace mundial2026.API.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize(Roles = Roles.Usuario)]
public class TicketsController : ControllerBase
{
    private readonly IEntradaService _entradaService;
    private readonly IQrService _qrService;
    private readonly ILogger<TicketsController> _logger;

    public TicketsController(
        IEntradaService entradaService,
        IQrService qrService,
        ILogger<TicketsController> logger)
    {
        _entradaService = entradaService;
        _qrService = qrService;
        _logger = logger;
    }

    [HttpGet("activas")]
    public async Task<IActionResult> GetActivas()
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var entradas = await _entradaService.GetActivasByTitularAsync(email);
            return Ok(entradas.Select(MapTicketActivo).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al listar entradas activas: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpGet("{id}/qr")]
    public async Task<IActionResult> GetQr(int id)
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var qr = await _qrService.ObtenerQrActivoAsync(email, id);
            return Ok(new QrResponse
            {
                QrCode = qr.Token,
                ExpiresIn = qr.ExpiresIn,
                ExpiraEn = qr.ExpiraEn
            });
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
            _logger.LogError($"Error al generar QR: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    private string? GetEmailUsuario() =>
        User.FindFirstValue(ClaimTypes.Email)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

    private static TicketActivoResponse MapTicketActivo(Entrada e)
    {
        var eventoFecha = e.EventoFecha ?? DateTime.UtcNow;
        var isLive = eventoFecha.Date == DateTime.UtcNow.Date
            && eventoFecha <= DateTime.UtcNow.AddHours(3);

        return new TicketActivoResponse
        {
            Id = e.IdEntrada,
            Fecha = eventoFecha.ToString("dd MMM • HH:mm", CultureInfo.InvariantCulture).ToUpperInvariant(),
            IsLive = isLive,
            EquipoLocal = e.EquipoLocalNombre ?? string.Empty,
            EquipoVisita = e.EquipoVisitanteNombre ?? string.Empty,
            Estadio = e.EstadioNombre ?? string.Empty,
            Sector = e.CodigoSector,
            Fila = (e.IdEntrada % 30 + 1).ToString(CultureInfo.InvariantCulture),
            VecesTransferida = e.VecesTransferida
        };
    }
}
