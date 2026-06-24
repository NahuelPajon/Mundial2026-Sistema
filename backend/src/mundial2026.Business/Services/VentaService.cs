using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class VentaService : IVentaService
{
    private const int MaxEntradasPorVenta = 5;

    private static readonly HashSet<string> EstadosEventoComprables =
        new(StringComparer.OrdinalIgnoreCase) { "programado", "en_curso" };

    private readonly IVentaRepository _ventaRepository;
    private readonly ITasaComisionRepository _tasaComisionRepository;
    private readonly IEventoRepository _eventoRepository;
    private readonly ISectorRepository _sectorRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public VentaService(
        IVentaRepository ventaRepository,
        ITasaComisionRepository tasaComisionRepository,
        IEventoRepository eventoRepository,
        ISectorRepository sectorRepository,
        IUsuarioRepository usuarioRepository)
    {
        _ventaRepository = ventaRepository;
        _tasaComisionRepository = tasaComisionRepository;
        _eventoRepository = eventoRepository;
        _sectorRepository = sectorRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<Venta> ComprarAsync(string emailUsuario, List<CompraEntradaDto> entradas)
    {
        if (string.IsNullOrWhiteSpace(emailUsuario))
            throw new ArgumentException("Email de usuario no puede estar vacío");

        if (entradas == null || entradas.Count == 0)
            throw new ArgumentException("Debe incluir al menos una entrada");

        if (entradas.Count > MaxEntradasPorVenta)
            throw new ArgumentException($"No se pueden comprar más de {MaxEntradasPorVenta} entradas por transacción");

        if (!await _usuarioRepository.ExistsByEmailAsync(emailUsuario))
            throw new KeyNotFoundException($"Usuario {emailUsuario} no encontrado");

        var tasa = await _tasaComisionRepository.GetVigenteAsync(DateTime.UtcNow)
            ?? throw new InvalidOperationException("No hay tasa de comisión vigente para la fecha actual");

        var items = new List<CompraEntradaItem>();

        foreach (var entrada in entradas)
        {
            if (entrada.IdEvento <= 0)
                throw new ArgumentException("ID de evento inválido");

            if (string.IsNullOrWhiteSpace(entrada.CodigoSector))
                throw new ArgumentException("Código de sector no puede estar vacío");

            var codigoSector = entrada.CodigoSector.Trim().ToUpperInvariant();

            var estadioInfo = await _eventoRepository.GetEstadioInfoAsync(entrada.IdEvento);
            if (estadioInfo == null)
                throw new KeyNotFoundException($"Evento con ID {entrada.IdEvento} no encontrado");

            var (idEstadio, estadoEvento) = estadioInfo.Value;
            if (!EstadosEventoComprables.Contains(estadoEvento))
                throw new InvalidOperationException($"El evento {entrada.IdEvento} no está disponible para compra (estado: {estadoEvento})");

            if (!await _eventoRepository.IsSectorHabilitadoAsync(entrada.IdEvento, idEstadio, codigoSector))
                throw new ArgumentException(
                    $"El sector {codigoSector} no está habilitado para el evento {entrada.IdEvento}");

            var costo = await _sectorRepository.GetCostoAsync(idEstadio, codigoSector);
            if (costo == null)
                throw new ArgumentException($"Sector {codigoSector} no existe en el estadio del evento");

            items.Add(new CompraEntradaItem
            {
                IdEvento = entrada.IdEvento,
                IdEstadio = idEstadio,
                CodigoSector = codigoSector,
                Costo = costo.Value
            });
        }

        var subtotal = items.Sum(i => i.Costo);
        var comision = Math.Round(subtotal * tasa.Porcentaje / 100m, 2);
        var montoTotal = subtotal + comision;

        return await _ventaRepository.CreateWithEntradasAsync(
            emailUsuario,
            tasa.IdTasa,
            tasa.Porcentaje,
            montoTotal,
            subtotal,
            items);
    }

    public async Task<Venta> GetByIdAsync(int idVenta, string emailUsuario)
    {
        if (idVenta <= 0)
            throw new ArgumentException("ID de venta inválido");

        var venta = await _ventaRepository.GetByIdAsync(idVenta);
        if (venta == null)
            throw new KeyNotFoundException($"Venta con ID {idVenta} no encontrada");

        if (!venta.EmailUsuario.Equals(emailUsuario, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("No tiene permiso para ver esta venta");

        return venta;
    }

    public async Task<List<Venta>> GetMisComprasAsync(string emailUsuario)
    {
        if (string.IsNullOrWhiteSpace(emailUsuario))
            throw new ArgumentException("Email de usuario no puede estar vacío");

        return await _ventaRepository.GetByUsuarioAsync(emailUsuario);
    }
}
