namespace mundial2026.DataAccess.Models;

public class EntradaAsignada
{
    public int IdEntrada { get; set; }
    public int IdEvento { get; set; }
    public string EquipoLocalNombre { get; set; } = string.Empty;
    public string EquipoVisitanteNombre { get; set; } = string.Empty;
    public DateTime EventoFecha { get; set; }
    public string EstadioNombre { get; set; } = string.Empty;
    public string CodigoSector { get; set; } = string.Empty;
    public decimal Costo { get; set; }
    public bool Consumida { get; set; }
}

public class RankingComprador
{
    public string Email { get; set; } = string.Empty;
    public int CantidadEntradasCompradas { get; set; }
    public decimal MontoTotalGastado { get; set; }
}

public class EventoMasVendido
{
    public int IdEvento { get; set; }
    public string EquipoLocalNombre { get; set; } = string.Empty;
    public string EquipoVisitanteNombre { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string EstadioNombre { get; set; } = string.Empty;
    public int EntradasVendidas { get; set; }
    public int CapacidadTotal { get; set; }
}

public class ResumenSistema
{
    public int TotalEntradasVendidas { get; set; }
    public decimal RecaudacionTotal { get; set; }
    public decimal PorcentajeComision { get; set; }
    public int EstadiosActivos { get; set; }
    public int TotalEstadios { get; set; }
}
