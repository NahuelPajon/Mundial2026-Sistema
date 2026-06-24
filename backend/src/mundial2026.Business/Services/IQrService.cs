using mundial2026.DataAccess.Models;

namespace mundial2026.Business.Services;

public class QrActivoDto
{
    public string Token { get; set; } = string.Empty;
    public int IdEntrada { get; set; }
    public DateTime GeneradoEn { get; set; }
    public DateTime ExpiraEn { get; set; }
    public int ExpiresIn { get; set; }
}

public interface IQrService
{
    Task<QrActivoDto> ObtenerQrActivoAsync(string emailTitular, int idEntrada);
}
