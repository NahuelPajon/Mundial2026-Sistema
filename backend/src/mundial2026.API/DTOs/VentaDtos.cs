namespace mundial2026.API.DTOs;

public class CompraEntradaRequest
{
    public int IdEvento { get; set; }
    public string CodigoSector { get; set; } = string.Empty;
}

public class CreateVentaRequest
{
    public List<CompraEntradaRequest> Entradas { get; set; } = new();
}

public class EntradaResponse
{
    public int IdEntrada { get; set; }
    public int IdEvento { get; set; }
    public int IdEstadio { get; set; }
    public string CodigoSector { get; set; } = string.Empty;
    public decimal Costo { get; set; }
    public bool Consumida { get; set; }
    public string? EquipoLocalNombre { get; set; }
    public string? EquipoVisitanteNombre { get; set; }
    public DateTime? EventoFecha { get; set; }
    public string? EstadioNombre { get; set; }
}

public class VentaResponse
{
    public int IdVenta { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = string.Empty;
    public decimal MontoTotal { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Comision { get; set; }
    public decimal PorcentajeComision { get; set; }
    public int CantidadComprada { get; set; }
    public string EmailUsuario { get; set; } = string.Empty;
    public List<EntradaResponse> Entradas { get; set; } = new();
}

public class TasaComisionResponse
{
    public int IdTasa { get; set; }
    public decimal Porcentaje { get; set; }
    public DateTime FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}
