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
public class VentasController : ControllerBase
{
    private readonly IVentaService _ventaService;
    private readonly ITasaComisionRepository _tasaComisionRepository;
    private readonly ILogger<VentasController> _logger;

    public VentasController(
        IVentaService ventaService,
        ITasaComisionRepository tasaComisionRepository,
        ILogger<VentasController> logger)
    {
        _ventaService = ventaService;
        _tasaComisionRepository = tasaComisionRepository;
        _logger = logger;
    }

    /// <summary>
    /// Tasa de comisión vigente para la fecha actual
    /// </summary>
    [HttpGet("tasa-comision")]
    public async Task<IActionResult> GetTasaComisionVigente()
    {
        try
        {
            var tasa = await _tasaComisionRepository.GetVigenteAsync(DateTime.UtcNow);
            if (tasa == null)
                return NotFound(new { error = "No hay tasa de comisión vigente" });

            return Ok(new TasaComisionResponse
            {
                IdTasa = tasa.IdTasa,
                Porcentaje = tasa.Porcentaje,
                FechaDesde = tasa.FechaDesde,
                FechaHasta = tasa.FechaHasta
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener tasa de comisión: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Usuario)]
    [HttpPost]
    public async Task<IActionResult> Comprar([FromBody] CreateVentaRequest request)
    {
        try
        {
            var email = User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(new { error = "Token inválido" });

            var venta = await _ventaService.ComprarAsync(email, request.Entradas.Select(e => new CompraEntradaDto
            {
                IdEvento = e.IdEvento,
                CodigoSector = e.CodigoSector
            }).ToList());

            _logger.LogInformation($"Venta {venta.IdVenta} creada por {email}");
            return CreatedAtAction(nameof(GetById), new { id = venta.IdVenta }, MapVentaResponse(venta));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
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
            _logger.LogError($"Error al crear venta: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Usuario)]
    [HttpGet("mis-compras")]
    public async Task<IActionResult> GetMisCompras()
    {
        try
        {
            var email = User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(new { error = "Token inválido" });

            var ventas = await _ventaService.GetMisComprasAsync(email);
            return Ok(ventas.Select(MapVentaResponse).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al listar compras: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Usuario)]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var email = User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(new { error = "Token inválido" });

            var venta = await _ventaService.GetByIdAsync(id, email);
            return Ok(MapVentaResponse(venta));
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
            _logger.LogError($"Error al obtener venta: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    private static VentaResponse MapVentaResponse(Venta venta)
    {
        var subtotal = venta.Entradas.Sum(e => e.Costo ?? 0);
        var comision = venta.MontoTotal - subtotal;

        return new VentaResponse
        {
            IdVenta = venta.IdVenta,
            Fecha = venta.Fecha,
            Estado = venta.Estado,
            MontoTotal = venta.MontoTotal,
            Subtotal = subtotal,
            Comision = comision,
            PorcentajeComision = venta.PorcentajeComision,
            CantidadComprada = venta.CantidadComprada,
            EmailUsuario = venta.EmailUsuario,
            Entradas = venta.Entradas.Select(e => new EntradaResponse
            {
                IdEntrada = e.IdEntrada,
                IdEvento = e.IdEvento,
                IdEstadio = e.IdEstadio,
                CodigoSector = e.CodigoSector,
                Costo = e.Costo ?? 0,
                Consumida = e.Consumida,
                EquipoLocalNombre = e.EquipoLocalNombre,
                EquipoVisitanteNombre = e.EquipoVisitanteNombre,
                EventoFecha = e.EventoFecha,
                EstadioNombre = e.EstadioNombre
            }).ToList()
        };
    }
}
