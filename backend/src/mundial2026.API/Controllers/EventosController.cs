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
public class EventosController : ControllerBase
{
    private readonly IEventoService _eventoService;
    private readonly ILogger<EventosController> _logger;

    public EventosController(IEventoService eventoService, ILogger<EventosController> logger)
    {
        _eventoService = eventoService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? idEstadio)
    {
        try
        {
            var eventos = await _eventoService.GetAllAsync(idEstadio);
            return Ok(eventos.Select(MapResponse).ToList());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener eventos: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var evento = await _eventoService.GetByIdAsync(id);
            return Ok(MapResponse(evento));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener evento: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEventoRequest request)
    {
        try
        {
            var emailAdmin = User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(emailAdmin))
                return Unauthorized(new { error = "Token inválido" });

            var idEvento = await _eventoService.CreateAsync(emailAdmin, new CreateEventoDto
            {
                Fecha = request.Fecha,
                Estado = request.Estado,
                IdEstadio = request.IdEstadio,
                IdEquipoLocal = request.IdEquipoLocal,
                IdEquipoVisitante = request.IdEquipoVisitante,
                SectoresHabilitados = request.SectoresHabilitados
            });

            _logger.LogInformation($"Evento {idEvento} creado por {emailAdmin}");
            return CreatedAtAction(nameof(GetById), new { id = idEvento },
                new { mensaje = "Evento creado exitosamente", idEvento });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al crear evento: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    private static EventoResponse MapResponse(Evento evento) => new()
    {
        IdEvento = evento.IdEvento,
        Fecha = evento.Fecha,
        Estado = evento.Estado,
        IdEstadio = evento.IdEstadio,
        EstadioNombre = evento.EstadioNombre,
        EmailAdmin = evento.EmailAdmin,
        IdEquipoLocal = evento.IdEquipoLocal,
        EquipoLocalNombre = evento.EquipoLocalNombre,
        IdEquipoVisitante = evento.IdEquipoVisitante,
        EquipoVisitanteNombre = evento.EquipoVisitanteNombre,
        SectoresHabilitados = evento.SectoresHabilitados
    };
}
