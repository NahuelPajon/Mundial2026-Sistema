namespace mundial2026.API.DTOs;

public class SolicitarTransferenciaRequest
{
    public int IdEntrada { get; set; }
    public string EmailDestino { get; set; } = string.Empty;
}

public class TransferenciaResponse
{
    public int IdTransferencia { get; set; }
    public int IdEntrada { get; set; }
    public string EmailOrigen { get; set; } = string.Empty;
    public string EmailDestino { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
    public DateTime? FechaAceptacion { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? OrdenHistorial { get; set; }
    public string EquipoLocalNombre { get; set; } = string.Empty;
    public string EquipoVisitanteNombre { get; set; } = string.Empty;
    public DateTime EventoFecha { get; set; }
    public string EstadioNombre { get; set; } = string.Empty;
    public string CodigoSector { get; set; } = string.Empty;
}
