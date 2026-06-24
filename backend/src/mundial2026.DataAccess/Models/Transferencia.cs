namespace mundial2026.DataAccess.Models;

public class Transferencia
{
    public int IdTransferencia { get; set; }
    public int IdEntrada { get; set; }
    public string EmailOrigen { get; set; } = string.Empty;
    public string EmailDestino { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
    public DateTime? FechaAceptacion { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? OrdenHistorial { get; set; }

    public string? EquipoLocalNombre { get; set; }
    public string? EquipoVisitanteNombre { get; set; }
    public DateTime? EventoFecha { get; set; }
    public string? EstadioNombre { get; set; }
    public string? CodigoSector { get; set; }
}
