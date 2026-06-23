using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public interface IEventoService
{
    Task<Evento> GetByIdAsync(int idEvento);
    Task<List<Evento>> GetAllAsync(int? idEstadio = null);
    Task<int> CreateAsync(string emailAdmin, CreateEventoDto dto);
}

public class CreateEventoDto
{
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = "programado";
    public int IdEstadio { get; set; }
    public int IdEquipoLocal { get; set; }
    public int IdEquipoVisitante { get; set; }
    public List<string> SectoresHabilitados { get; set; } = new();
}
