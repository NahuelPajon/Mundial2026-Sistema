using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IReporteRepository
{
    Task<List<EntradaAsignada>> GetEntradasAsignadasByUsuarioAsync(string email);
    Task<List<RankingComprador>> GetRankingCompradoresAsync(int limit = 10);
    Task<List<EventoMasVendido>> GetEventosMasVendidosAsync(int limit = 10);
    Task<ResumenSistema> GetResumenSistemaAsync();
}
