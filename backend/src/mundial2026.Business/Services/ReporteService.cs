using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public interface IReporteService
{
    Task<List<EntradaAsignada>> GetMisEntradasAsignadasAsync(string email);
    Task<List<Venta>> GetMisComprasAsync(string email);
    Task<List<RankingComprador>> GetRankingCompradoresAsync(int limit = 10);
    Task<List<EventoMasVendido>> GetEventosMasVendidosAsync(int limit = 10);
    Task<ResumenSistema> GetResumenSistemaAsync();
}

public class ReporteService : IReporteService
{
    private readonly IReporteRepository _reporteRepository;
    private readonly IVentaService _ventaService;

    public ReporteService(IReporteRepository reporteRepository, IVentaService ventaService)
    {
        _reporteRepository = reporteRepository;
        _ventaService = ventaService;
    }

    public async Task<List<EntradaAsignada>> GetMisEntradasAsignadasAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email no puede estar vacío");

        return await _reporteRepository.GetEntradasAsignadasByUsuarioAsync(email);
    }

    public Task<List<Venta>> GetMisComprasAsync(string email) =>
        _ventaService.GetMisComprasAsync(email);

    public Task<List<RankingComprador>> GetRankingCompradoresAsync(int limit = 10) =>
        _reporteRepository.GetRankingCompradoresAsync(limit);

    public Task<List<EventoMasVendido>> GetEventosMasVendidosAsync(int limit = 10) =>
        _reporteRepository.GetEventosMasVendidosAsync(limit);

    public Task<ResumenSistema> GetResumenSistemaAsync() =>
        _reporteRepository.GetResumenSistemaAsync();
}
