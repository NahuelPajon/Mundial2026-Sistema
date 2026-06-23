using mundial2026.Business.Services;
using mundial2026.API.DTOs;
using Microsoft.AspNetCore.Mvc;

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

    /// <summary>
    /// Obtiene todos los estadios
    /// </summary>
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

    /// <summary>
    /// Obtiene un estadio por ID
    /// </summary>
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
            _logger.LogWarning($"Estadio no encontrado: {ex.Message}");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error inesperado: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Crea un nuevo estadio con sectores
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEstadioRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var idEstadio = await _estadioService.CreateAsync(
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

            _logger.LogInformation($"Estadio '{request.Nombre}' creado con ID {idEstadio}");
            return CreatedAtAction(nameof(GetById), new { id = idEstadio }, 
                new { mensaje = "Estadio creado exitosamente", idEstadio });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning($"Validación fallida: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Operación inválida: {ex.Message}");
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error inesperado: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }
}
