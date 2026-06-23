namespace mundial2026.DataAccess.Models;

public class Validacion
{
    public int IdValidacion { get; set; }
    public DateTime Fecha { get; set; }
    public int IdEntrada { get; set; }
    public string TokenQr { get; set; } = string.Empty;
    public int IdDispositivo { get; set; }
    public string EmailFuncionario { get; set; } = string.Empty;

    public string? CodigoSector { get; set; }
    public string? EstadioNombre { get; set; }
    public string? EquipoLocalNombre { get; set; }
    public string? EquipoVisitanteNombre { get; set; }
}
