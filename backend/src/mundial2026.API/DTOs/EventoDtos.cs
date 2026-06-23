namespace mundial2026.API.DTOs;

public class EventoResponse
{
    public int IdEvento { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int IdEstadio { get; set; }
    public string EstadioNombre { get; set; } = string.Empty;
    public string EmailAdmin { get; set; } = string.Empty;
    public int IdEquipoLocal { get; set; }
    public string EquipoLocalNombre { get; set; } = string.Empty;
    public int IdEquipoVisitante { get; set; }
    public string EquipoVisitanteNombre { get; set; } = string.Empty;
    public List<string> SectoresHabilitados { get; set; } = new();
}

public class CreateEventoRequest
{
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = "programado";
    public int IdEstadio { get; set; }
    public int IdEquipoLocal { get; set; }
    public int IdEquipoVisitante { get; set; }
    public List<string> SectoresHabilitados { get; set; } = new();
}
