namespace mundial2026.DataAccess.Models;

public class Usuario : Perfil
{
    public DateTime FechaRegistro { get; set; }
    public string EstadoVerificacion { get; set; } = "pendiente"; // "pendiente", "verificado"
}
