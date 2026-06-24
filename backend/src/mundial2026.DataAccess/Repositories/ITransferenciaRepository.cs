using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface ITransferenciaRepository
{
    Task<Transferencia?> GetByIdAsync(int idTransferencia);
    Task<List<Transferencia>> GetByUsuarioAsync(string email, string? tipo = null);
    Task<bool> HasPendingForEntradaAsync(int idEntrada);
    Task<int> CountHistorialByEntradaAsync(int idEntrada);
    Task<int> CreateSolicitudAsync(int idEntrada, string emailOrigen, string emailDestino);
    Task<Transferencia> AceptarAsync(int idTransferencia, string emailDestino);
    Task<Transferencia> RechazarAsync(int idTransferencia, string emailDestino);
}
