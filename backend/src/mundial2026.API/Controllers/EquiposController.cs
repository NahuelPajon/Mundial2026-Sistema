using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using mundial2026.API.DTOs;
using mundial2026.Business.Security;
using mundial2026.Business.Services;

namespace mundial2026.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquiposController : ControllerBase
{
    private readonly IEquipoService _equipoService;
    private readonly ILogger<EquiposController> _logger;

    public EquiposController(IEquipoService equipoService, ILogger<EquiposController> logger)
    {
        _equipoService = equipoService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var equipos = await _equipoService.GetAllAsync();
            var response = equipos.Select(e => new EquipoResponse
            {
                IdEquipo = e.IdEquipo,
                Nombre = e.Nombre,
                Pais = e.Pais
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener equipos: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var equipo = await _equipoService.GetByIdAsync(id);
            return Ok(new EquipoResponse
            {
                IdEquipo = equipo.IdEquipo,
                Nombre = equipo.Nombre,
                Pais = equipo.Pais
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener equipo: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEquipoRequest request)
    {
        try
        {
            var idEquipo = await _equipoService.CreateAsync(request.Nombre, request.Pais);
            return CreatedAtAction(nameof(GetById), new { id = idEquipo },
                new { mensaje = "Equipo creado exitosamente", idEquipo });
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
            _logger.LogError($"Error al crear equipo: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEquipoRequest request)
    {
        try
        {
            await _equipoService.UpdateAsync(id, request.Nombre, request.Pais);
            return Ok(new { mensaje = "Equipo actualizado exitosamente" });
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
            _logger.LogError($"Error al actualizar equipo: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _equipoService.DeleteAsync(id);
            return Ok(new { mensaje = "Equipo eliminado exitosamente" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al eliminar equipo: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }
}
