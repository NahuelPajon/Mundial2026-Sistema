using System.Data;
using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class PerfilRepository : IPerfilRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public PerfilRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Perfil?> GetByEmailAsync(string email)
    {
        const string query = @"
            SELECT email, pais_dir, localidad, calle, numero_dir, cod_postal, 
                   doc_pais, doc_tipo, doc_numero
            FROM Perfil
            WHERE email = @email";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        var perfil = new Perfil
        {
            Email = reader.GetString(0),
            PaisDir = reader.GetString(1),
            Localidad = reader.GetString(2),
            Calle = reader.GetString(3),
            NumeroDir = reader.GetString(4),
            CodPostal = reader.GetString(5),
            DocPais = reader.GetString(6),
            DocTipo = reader.GetString(7),
            DocNumero = reader.GetString(8)
        };

        await reader.CloseAsync();

        // Obtener telefonos
        perfil.Telefonos = await GetTelefonosAsync(email, connection);

        return perfil;
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Perfil WHERE email = @email)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<bool> ExistsByDocumentoAsync(string pais, string tipo, string numero)
    {
        const string query = @"
            SELECT EXISTS(SELECT 1 FROM Perfil 
            WHERE doc_pais = @pais AND doc_tipo = @tipo AND doc_numero = @numero)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@pais", pais);
        command.Parameters.AddWithValue("@tipo", tipo);
        command.Parameters.AddWithValue("@numero", numero);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task CreateAsync(Perfil perfil)
    {
        const string query = @"
            INSERT INTO Perfil (email, pais_dir, localidad, calle, numero_dir, cod_postal, 
                               doc_pais, doc_tipo, doc_numero)
            VALUES (@email, @pais_dir, @localidad, @calle, @numero_dir, @cod_postal, 
                   @doc_pais, @doc_tipo, @doc_numero)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", perfil.Email);
        command.Parameters.AddWithValue("@pais_dir", perfil.PaisDir);
        command.Parameters.AddWithValue("@localidad", perfil.Localidad);
        command.Parameters.AddWithValue("@calle", perfil.Calle);
        command.Parameters.AddWithValue("@numero_dir", perfil.NumeroDir);
        command.Parameters.AddWithValue("@cod_postal", perfil.CodPostal);
        command.Parameters.AddWithValue("@doc_pais", perfil.DocPais);
        command.Parameters.AddWithValue("@doc_tipo", perfil.DocTipo);
        command.Parameters.AddWithValue("@doc_numero", perfil.DocNumero);

        await command.ExecuteNonQueryAsync();

        // Insertar telefonos
        foreach (var telefono in perfil.Telefonos)
        {
            await AddTelefonoAsync(perfil.Email, telefono);
        }
    }

    public async Task UpdateAsync(Perfil perfil)
    {
        const string query = @"
            UPDATE Perfil 
            SET pais_dir = @pais_dir, localidad = @localidad, calle = @calle, 
                numero_dir = @numero_dir, cod_postal = @cod_postal
            WHERE email = @email";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", perfil.Email);
        command.Parameters.AddWithValue("@pais_dir", perfil.PaisDir);
        command.Parameters.AddWithValue("@localidad", perfil.Localidad);
        command.Parameters.AddWithValue("@calle", perfil.Calle);
        command.Parameters.AddWithValue("@numero_dir", perfil.NumeroDir);
        command.Parameters.AddWithValue("@cod_postal", perfil.CodPostal);

        await command.ExecuteNonQueryAsync();
    }

    public async Task AddTelefonoAsync(string email, string telefono)
    {
        const string query = @"
            INSERT INTO Telefono (email_perfil, telefono)
            VALUES (@email, @telefono)
            ON CONFLICT DO NOTHING";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);
        command.Parameters.AddWithValue("@telefono", telefono);

        await command.ExecuteNonQueryAsync();
    }

    public async Task RemoveTelefonoAsync(string email, string telefono)
    {
        const string query = @"
            DELETE FROM Telefono 
            WHERE email_perfil = @email AND telefono = @telefono";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);
        command.Parameters.AddWithValue("@telefono", telefono);

        await command.ExecuteNonQueryAsync();
    }

    private async Task<List<string>> GetTelefonosAsync(string email, NpgsqlConnection connection)
    {
        var telefonos = new List<string>();
        const string query = "SELECT telefono FROM Telefono WHERE email_perfil = @email";

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            telefonos.Add(reader.GetString(0));
        }

        return telefonos;
    }
}
