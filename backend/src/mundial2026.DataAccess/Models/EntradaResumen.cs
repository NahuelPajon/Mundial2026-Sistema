namespace mundial2026.DataAccess.Models;

public class EntradaResumen
{
    public int IdEntrada { get; set; }
    public string Titular { get; set; } = string.Empty;
    public bool Consumida { get; set; }
    public int IdEvento { get; set; }
    public string CodigoSector { get; set; } = string.Empty;
}
