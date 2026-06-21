using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class FuncionarioRepository : IFuncionarioRepository
{
    private readonly ConnectionFactory _connectionFactory;
    private readonly IPerfilRepository _perfilRepository;

    public FuncionarioRepository(ConnectionFactory connectionFactory, IPerfilRepository perfilRepository)
    {
        _connectionFactory = connectionFactory;
        _perfilRepository = perfilRepository;
    }

    public async Task<Funcionario?> GetByEmailAsync(string email)
    {
        const string query = @"
            SELECT email_perfil, nro_legajo
            FROM Funcionario
            WHERE email_perfil = @email";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        string nroLegajo;
        using (var reader = await command.ExecuteReaderAsync())
        {
            if (!await reader.ReadAsync())
                return null;

            nroLegajo = reader.GetString(1);
        }

        var perfil = await _perfilRepository.GetByEmailAsync(email);
        if (perfil == null)
            return null;

        return new Funcionario
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
            NroLegajo = nroLegajo
        };
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Funcionario WHERE email_perfil = @email)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<bool> ExistsByLegajoAsync(string nroLegajo)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Funcionario WHERE nro_legajo = @nro_legajo)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@nro_legajo", nroLegajo);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public Task CreateAsync(Funcionario funcionario, NpgsqlConnection connection, NpgsqlTransaction transaction)
    {
        const string query = @"
            INSERT INTO Funcionario (email_perfil, nro_legajo)
            VALUES (@email, @nro_legajo)";

        using var command = new NpgsqlCommand(query, connection, transaction);
        command.Parameters.AddWithValue("@email", funcionario.Email);
        command.Parameters.AddWithValue("@nro_legajo", funcionario.NroLegajo);
        return command.ExecuteNonQueryAsync();
    }
}
