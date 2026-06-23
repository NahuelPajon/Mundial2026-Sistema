namespace mundial2026.DataAccess.Models;

public class Evento
{
    public int IdEvento { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int IdEstadio { get; set; }
    public string EmailAdmin { get; set; } = string.Empty;
    public int IdEquipoLocal { get; set; }
    public int IdEquipoVisitante { get; set; }

    public string EstadioNombre { get; set; } = string.Empty;
    public string EquipoLocalNombre { get; set; } = string.Empty;
    public string EquipoVisitanteNombre { get; set; } = string.Empty;
    public List<string> SectoresHabilitados { get; set; } = new();
}
