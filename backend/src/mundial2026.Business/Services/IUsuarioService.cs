namespace mundial2026.Business.Services;

public interface IUsuarioService
{
    Task<dynamic> GetByEmailAsync(string email);
    Task RegisterAsync(string email, string password, string paisDir, string localidad, string calle,
                      string numeroDir, string codPostal, string docPais, string docTipo,
                      string docNumero, List<string> telefonos);
}
