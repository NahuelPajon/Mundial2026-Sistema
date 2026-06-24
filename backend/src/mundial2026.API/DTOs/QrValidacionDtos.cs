namespace mundial2026.API.DTOs;

public class TicketActivoResponse
{
    public int Id { get; set; }
    public string Fecha { get; set; } = string.Empty;
    public bool IsLive { get; set; }
    public string EquipoLocal { get; set; } = string.Empty;
    public string EquipoVisita { get; set; } = string.Empty;
    public string Estadio { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
    public string Fila { get; set; } = string.Empty;
}

public class QrResponse
{
    public string QrCode { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public DateTime ExpiraEn { get; set; }
}

public class ValidarEntradaRequest
{
    public string QrCode { get; set; } = string.Empty;
    public int? IdDispositivo { get; set; }
}

public class ValidacionEscaneoResponse
{
    public string Status { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public int? IdValidacion { get; set; }
    public int? IdEntrada { get; set; }
}

public class CreateDispositivoRequest
{
    public string Descripcion { get; set; } = string.Empty;
    public string EmailFuncionario { get; set; } = string.Empty;
}

public class DispositivoResponse
{
    public int IdDispositivo { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string EmailFuncionario { get; set; } = string.Empty;
}

public class ValidacionHistorialResponse
{
    public int IdValidacion { get; set; }
    public DateTime Fecha { get; set; }
    public int IdEntrada { get; set; }
    public string TokenQr { get; set; } = string.Empty;
    public int IdDispositivo { get; set; }
    public string CodigoSector { get; set; } = string.Empty;
    public string EstadioNombre { get; set; } = string.Empty;
    public string EquipoLocalNombre { get; set; } = string.Empty;
    public string EquipoVisitanteNombre { get; set; } = string.Empty;
}
