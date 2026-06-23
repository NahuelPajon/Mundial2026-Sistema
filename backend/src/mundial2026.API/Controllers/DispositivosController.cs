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
[Authorize]
public class DispositivosController : ControllerBase
{
    private readonly IDispositivoService _dispositivoService;
    private readonly ILogger<DispositivosController> _logger;

    public DispositivosController(
        IDispositivoService dispositivoService,
        ILogger<DispositivosController> logger)
    {
        _dispositivoService = dispositivoService;
        _logger = logger;
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var dispositivos = await _dispositivoService.GetAllAsync();
            return Ok(dispositivos.Select(MapResponse).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al listar dispositivos: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Funcionario)]
    [HttpGet("mis-dispositivos")]
    public async Task<IActionResult> GetMisDispositivos()
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null)
                return Unauthorized(new { error = "Token inválido" });

            var dispositivos = await _dispositivoService.GetMisDispositivosAsync(email);
            return Ok(dispositivos.Select(MapResponse).ToList());
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al listar dispositivos del funcionario: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDispositivoRequest request)
    {
        try
        {
            var dispositivo = await _dispositivoService.CreateAsync(
                request.Descripcion, request.EmailFuncionario);

            return CreatedAtAction(nameof(GetAll), new DispositivoResponse
            {
                IdDispositivo = dispositivo.IdDispositivo,
                Descripcion = dispositivo.Descripcion,
                EmailFuncionario = dispositivo.EmailFuncionario
            });
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
            _logger.LogError($"Error al crear dispositivo: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _dispositivoService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al eliminar dispositivo: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    private string? GetEmailUsuario() =>
        User.FindFirstValue(ClaimTypes.Email)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

    private static DispositivoResponse MapResponse(Dispositivo d) => new()
    {
        IdDispositivo = d.IdDispositivo,
        Descripcion = d.Descripcion,
        EmailFuncionario = d.EmailFuncionario
    };
}
