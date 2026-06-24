using mundial2026.DataAccess.Models;

namespace mundial2026.DataAccess.Repositories;

public interface IQrRepository
{
    Task<Qr?> GetActivoVigenteByEntradaAsync(int idEntrada);
    Task<Qr> RotarTokenAsync(int idEntrada);
}
