namespace mundial2026.API.DTOs;

public class EntradaAsignadaResponse
{
    public int IdEntrada { get; set; }
    public int IdEvento { get; set; }
    public string EquipoLocal { get; set; } = string.Empty;
    public string EquipoVisitante { get; set; } = string.Empty;
    public DateTime EventoFecha { get; set; }
    public string Estadio { get; set; } = string.Empty;
    public string CodigoSector { get; set; } = string.Empty;
    public decimal Costo { get; set; }
    public bool Consumida { get; set; }
    public bool Activa { get; set; }
}

public class RankingCompradorResponse
{
    public string Email { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int CantidadEntradas { get; set; }
    public decimal MontoTotalGastado { get; set; }
}

public class EventoMasVendidoResponse
{
    public int IdEvento { get; set; }
    public string EquipoLocal { get; set; } = string.Empty;
    public string EquipoVisitante { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string Estadio { get; set; } = string.Empty;
    public int EntradasVendidas { get; set; }
    public int CapacidadTotal { get; set; }
    public decimal PorcentajeOcupacion { get; set; }
}

public class ResumenSistemaResponse
{
    public int TotalEntradasVendidas { get; set; }
    public decimal RecaudacionTotal { get; set; }
    public decimal PorcentajeComision { get; set; }
    public int EstadiosActivos { get; set; }
    public int TotalEstadios { get; set; }
}
