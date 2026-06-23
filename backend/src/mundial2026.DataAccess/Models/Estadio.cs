namespace mundial2026.DataAccess.Models;

public class Estadio
{
    public int IdEstadio { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int Aforo { get; set; }
    public string PaisDir { get; set; } = string.Empty;
    public string Localidad { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public string NumeroDir { get; set; } = string.Empty;
    
    public List<Sector> Sectores { get; set; } = new();
}
