namespace mundial2026.Business.Services;

public interface IPerfilService
{
    Task<dynamic> GetByEmailAsync(string email);
    Task CreateAsync(string email, string paisDir, string localidad, string calle, 
                     string numeroDir, string codPostal, string docPais, string docTipo, 
                     string docNumero, List<string> telefonos);
}
