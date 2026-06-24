using mundial2026.DataAccess.Models;

namespace mundial2026.Business.Services;

public class ValidacionEscaneoResult
{
    public string Status { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public int? IdValidacion { get; set; }
    public int? IdEntrada { get; set; }
}

public interface IValidacionService
{
    Task<ValidacionEscaneoResult> EscanearAsync(string emailFuncionario, string token, int idDispositivo);
    Task<ValidacionEscaneoResult> EscanearConDispositivoOpcionalAsync(
        string emailFuncionario, string token, int? idDispositivo);
    Task<List<Validacion>> GetHistorialAsync(string emailFuncionario);
    Task<int> GetTotalValidacionesAsync(string emailFuncionario);
}
