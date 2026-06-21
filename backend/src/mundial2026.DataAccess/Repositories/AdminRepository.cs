using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly ConnectionFactory _connectionFactory;
    private readonly IPerfilRepository _perfilRepository;

    public AdminRepository(ConnectionFactory connectionFactory, IPerfilRepository perfilRepository)
    {
        _connectionFactory = connectionFactory;
        _perfilRepository = perfilRepository;
    }

    public async Task<Admin?> GetByEmailAsync(string email)
    {
        const string query = @"
            SELECT email_perfil, fecha_asignacion
            FROM Admin
            WHERE email_perfil = @email";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        DateTime fechaAsignacion;
        using (var reader = await command.ExecuteReaderAsync())
        {
            if (!await reader.ReadAsync())
                return null;

            fechaAsignacion = reader.GetDateTime(1);
        }

        var perfil = await _perfilRepository.GetByEmailAsync(email);
        if (perfil == null)
            return null;

        return new Admin
        {
            Email = perfil.Email,
            PaisDir = perfil.PaisDir,
            Localidad = perfil.Localidad,
            Calle = perfil.Calle,
            NumeroDir = perfil.NumeroDir,
            CodPostal = perfil.CodPostal,
            DocPais = perfil.DocPais,
            DocTipo = perfil.DocTipo,
            DocNumero = perfil.DocNumero,
            Telefonos = perfil.Telefonos,
            FechaAsignacion = fechaAsignacion
        };
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Admin WHERE email_perfil = @email)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public Task CreateAsync(Admin admin, NpgsqlConnection connection, NpgsqlTransaction transaction)
    {
        const string query = @"
            INSERT INTO Admin (email_perfil, fecha_asignacion)
            VALUES (@email, @fecha_asignacion)";

        using var command = new NpgsqlCommand(query, connection, transaction);
        command.Parameters.AddWithValue("@email", admin.Email);
        command.Parameters.AddWithValue("@fecha_asignacion", admin.FechaAsignacion.Date);
        return command.ExecuteNonQueryAsync();
    }
}
