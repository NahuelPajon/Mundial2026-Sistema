using mundial2026.DataAccess.Models;

namespace mundial2026.Business.Services;

public interface ITransferenciaService
{
    Task<Transferencia> SolicitarAsync(string emailOrigen, int idEntrada, string emailDestino);
    Task<Transferencia> AceptarAsync(string emailUsuario, int idTransferencia);
    Task<Transferencia> RechazarAsync(string emailUsuario, int idTransferencia);
    Task<Transferencia> GetByIdAsync(int idTransferencia, string emailUsuario);
    Task<List<Transferencia>> GetByUsuarioAsync(string emailUsuario, string? tipo = null);
}
