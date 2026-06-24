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
public class ReportesController : ControllerBase
{
    private readonly IReporteService _reporteService;
    private readonly ILogger<ReportesController> _logger;

    public ReportesController(IReporteService reporteService, ILogger<ReportesController> logger)
    {
        _reporteService = reporteService;
        _logger = logger;
    }

    [Authorize(Roles = Roles.Usuario)]
    [HttpGet("mis-entradas")]
    public async Task<IActionResult> GetMisEntradasAsignadas()
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null) return Unauthorized(new { error = "Token inválido" });

            var entradas = await _reporteService.GetMisEntradasAsignadasAsync(email);
            return Ok(entradas.Select(MapEntradaAsignada).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al listar entradas asignadas: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Usuario)]
    [HttpGet("mis-compras")]
    public async Task<IActionResult> GetMisCompras()
    {
        try
        {
            var email = GetEmailUsuario();
            if (email == null) return Unauthorized(new { error = "Token inválido" });

            var ventas = await _reporteService.GetMisComprasAsync(email);
            return Ok(ventas.Select(MapVentaResumen).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al listar compras: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("ranking-compradores")]
    public async Task<IActionResult> GetRankingCompradores([FromQuery] int limit = 10)
    {
        try
        {
            if (limit <= 0 || limit > 50)
                return BadRequest(new { error = "El límite debe estar entre 1 y 50" });

            var ranking = await _reporteService.GetRankingCompradoresAsync(limit);
            return Ok(ranking.Select(MapRankingComprador).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener ranking de compradores: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("eventos-mas-vendidos")]
    public async Task<IActionResult> GetEventosMasVendidos([FromQuery] int limit = 10)
    {
        try
        {
            if (limit <= 0 || limit > 50)
                return BadRequest(new { error = "El límite debe estar entre 1 y 50" });

            var eventos = await _reporteService.GetEventosMasVendidosAsync(limit);
            return Ok(eventos.Select(MapEventoMasVendido).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener eventos más vendidos: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("resumen")]
    public async Task<IActionResult> GetResumenSistema()
    {
        try
        {
            var resumen = await _reporteService.GetResumenSistemaAsync();
            return Ok(new ResumenSistemaResponse
            {
                TotalEntradasVendidas = resumen.TotalEntradasVendidas,
                RecaudacionTotal = resumen.RecaudacionTotal,
                PorcentajeComision = resumen.PorcentajeComision,
                EstadiosActivos = resumen.EstadiosActivos,
                TotalEstadios = resumen.TotalEstadios
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener resumen del sistema: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    private string? GetEmailUsuario() =>
        User.FindFirstValue(ClaimTypes.Email)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

    private static EntradaAsignadaResponse MapEntradaAsignada(EntradaAsignada e) => new()
    {
        IdEntrada = e.IdEntrada,
        IdEvento = e.IdEvento,
        EquipoLocal = e.EquipoLocalNombre,
        EquipoVisitante = e.EquipoVisitanteNombre,
        EventoFecha = e.EventoFecha,
        Estadio = e.EstadioNombre,
        CodigoSector = e.CodigoSector,
        Costo = e.Costo,
        Consumida = e.Consumida,
        Activa = !e.Consumida
    };

    private static RankingCompradorResponse MapRankingComprador(RankingComprador r)
    {
        var nombre = r.Email.Split('@')[0].Replace('.', ' ');
        return new RankingCompradorResponse
        {
            Email = r.Email,
            Nombre = char.ToUpper(nombre[0]) + nombre[1..],
            CantidadEntradas = r.CantidadEntradasCompradas,
            MontoTotalGastado = r.MontoTotalGastado
        };
    }

    private static EventoMasVendidoResponse MapEventoMasVendido(EventoMasVendido e)
    {
        var porcentaje = e.CapacidadTotal > 0
            ? Math.Round(100m * e.EntradasVendidas / e.CapacidadTotal, 1)
            : 0;

        return new EventoMasVendidoResponse
        {
            IdEvento = e.IdEvento,
            EquipoLocal = e.EquipoLocalNombre,
            EquipoVisitante = e.EquipoVisitanteNombre,
            Fecha = e.Fecha,
            Estadio = e.EstadioNombre,
            EntradasVendidas = e.EntradasVendidas,
            CapacidadTotal = e.CapacidadTotal,
            PorcentajeOcupacion = porcentaje
        };
    }

    private static object MapVentaResumen(Venta v)
    {
        var subtotal = v.Entradas.Sum(e => e.Costo ?? 0);
        return new
        {
            v.IdVenta,
            v.Fecha,
            v.Estado,
            v.MontoTotal,
            Subtotal = subtotal,
            Comision = v.MontoTotal - subtotal,
            v.CantidadComprada,
            v.EmailUsuario,
            Entradas = v.Entradas.Select(e => new
            {
                e.IdEntrada,
                e.IdEvento,
                e.CodigoSector,
                e.Consumida,
                e.EquipoLocalNombre,
                e.EquipoVisitanteNombre,
                e.EventoFecha,
                e.EstadioNombre
            }).ToList()
        };
    }
}
