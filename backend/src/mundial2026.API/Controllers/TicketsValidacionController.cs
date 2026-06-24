using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using mundial2026.API.DTOs;
using mundial2026.Business.Security;
using mundial2026.Business.Services;

namespace mundial2026.API.Controllers;

/// <summary>
/// Alias de ruta para compatibilidad con el frontend (/api/tickets/validar).
/// </summary>
[ApiController]
[Route("api/tickets")]
[Authorize(Roles = Roles.Funcionario)]
public class TicketsValidacionController : ControllerBase
{
    private readonly IValidacionService _validacionService;
    private readonly ILogger<ValidacionController> _logger;

    public TicketsValidacionController(
        IValidacionService validacionService,
        ILogger<ValidacionController> logger)
    {
        _validacionService = validacionService;
        _logger = logger;
    }

    [HttpPost("validar")]
    public async Task<IActionResult> Validar([FromBody] ValidarEntradaRequest request)
    {
        try
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(new { error = "Token inválido" });

            var resultado = await _validacionService.EscanearConDispositivoOpcionalAsync(
                email, request.QrCode, request.IdDispositivo);

            _logger.LogInformation(
                "Validación {Status} por {Email} — entrada {IdEntrada}",
                resultado.Status, email, resultado.IdEntrada);

            return Ok(ValidacionController.MapEscaneoResponse(resultado));
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
}
