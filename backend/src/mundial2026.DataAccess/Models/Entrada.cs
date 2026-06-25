namespace mundial2026.DataAccess.Models;

public class Entrada
{
    public int IdEntrada { get; set; }
    public string Titular { get; set; } = string.Empty;
    public int IdVenta { get; set; }
    public int IdEvento { get; set; }
    public int IdEstadio { get; set; }
    public string CodigoSector { get; set; } = string.Empty;
    public bool Consumida { get; set; }

    public string? EquipoLocalNombre { get; set; }
    public string? EquipoVisitanteNombre { get; set; }
    public DateTime? EventoFecha { get; set; }
    public string? EstadioNombre { get; set; }
    public decimal? Costo { get; set; }
    public int VecesTransferida { get; set; }
}