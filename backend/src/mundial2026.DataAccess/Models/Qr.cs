namespace mundial2026.DataAccess.Models;

public class Qr
{
    public string Token { get; set; } = string.Empty;
    public int IdEntrada { get; set; }
    public DateTime GeneradoEn { get; set; }
    public DateTime ExpiraEn { get; set; }
    public bool Activo { get; set; }
}
