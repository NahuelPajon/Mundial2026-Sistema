using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using mundial2026.API.DTOs;
using mundial2026.Business.Security;
using mundial2026.Business.Services;

namespace mundial2026.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstadiosController : ControllerBase
{
    private readonly IEstadioService _estadioService;
    private readonly ILogger<EstadiosController> _logger;

    public EstadiosController(IEstadioService estadioService, ILogger<EstadiosController> logger)
    {
        _estadioService = estadioService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var estadios = await _estadioService.GetAllAsync();
            var response = estadios.Select(e => new EstadioResponse
            {
                IdEstadio = e.IdEstadio,
                Nombre = e.Nombre,
                Aforo = e.Aforo,
                PaisDir = e.PaisDir,
                Localidad = e.Localidad,
                Calle = e.Calle,
                NumeroDir = e.NumeroDir,
                Sectores = e.Sectores.Select(s => new SectorResponse
                {
                    Codigo = s.Codigo,
                    CapacidadMaxima = s.CapacidadMaxima,
                    Costo = s.Costo,
                    EntradasDisponibles = s.EntradasDisponibles
                }).ToList()
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener estadios: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var estadio = await _estadioService.GetByIdAsync(id);
            var response = new EstadioResponse
            {
                IdEstadio = estadio.IdEstadio,
                Nombre = estadio.Nombre,
                Aforo = estadio.Aforo,
                PaisDir = estadio.PaisDir,
                Localidad = estadio.Localidad,
                Calle = estadio.Calle,
                NumeroDir = estadio.NumeroDir,
                Sectores = estadio.Sectores.Select(s => new SectorResponse
                {
                    Codigo = s.Codigo,
                    CapacidadMaxima = s.CapacidadMaxima,
                    Costo = s.Costo,
                    EntradasDisponibles = s.EntradasDisponibles
                }).ToList()
            };

            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error inesperado: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtiene los sectores de un estadio (accesible por todos los roles)
    /// </summary>
    [HttpGet("{id}/sectores")]
    public async Task<IActionResult> GetSectores(int id)
    {
        try
        {
            var sectores = await _estadioService.GetSectoresAsync(id);
            var response = sectores.Select(s => new
            {
                idSector = s.Codigo,
                nombre = s.Codigo,       // si no tenés nombre en BD, usás el código
                capacidad = s.CapacidadMaxima,
                precioBase = s.Costo,
                isVIP = false
            });

            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener sectores: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Actualiza el precio de un sector. Solo el admin del país correspondiente puede hacerlo.
    /// </summary>
    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id}/sectores/{codigo}")]
    public async Task<IActionResult> UpdateSectorPrecio(int id, string codigo, [FromBody] UpdateSectorPrecioRequest request)
    {
        try
        {
            var emailAdmin = User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(emailAdmin))
                return Unauthorized(new { error = "Token inválido" });

            await _estadioService.UpdateSectorPrecioAsync(emailAdmin, id, codigo, request.PrecioBase);

            _logger.LogInformation($"Admin {emailAdmin} actualizó precio del sector {codigo} en estadio {id}");
            return Ok(new { mensaje = "Precio actualizado correctamente" });
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
        catch (Exception ex)
        {
            _logger.LogError($"Error al actualizar sector: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Crea un nuevo estadio. Solo el admin del país correspondiente puede hacerlo.
    /// </summary>
    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEstadioRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var emailAdmin = User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(emailAdmin))
                return Unauthorized(new { error = "Token inválido" });

            var idEstadio = await _estadioService.CreateAsync(
                emailAdmin,
                request.Nombre,
                request.Aforo,
                request.PaisDir,
                request.Localidad,
                request.Calle,
                request.NumeroDir,
                request.Sectores.Select(s => new Business.Services.SectorCreationDto
                {
                    Codigo = s.Codigo,
                    CapacidadMaxima = s.CapacidadMaxima,
                    Costo = s.Costo
                }).ToList()
            );

            _logger.LogInformation($"Estadio '{request.Nombre}' creado por {emailAdmin} con ID {idEstadio}");
            return CreatedAtAction(nameof(GetById), new { id = idEstadio },
                new { mensaje = "Estadio creado exitosamente", idEstadio });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
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
            _logger.LogError($"Error inesperado: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }
}