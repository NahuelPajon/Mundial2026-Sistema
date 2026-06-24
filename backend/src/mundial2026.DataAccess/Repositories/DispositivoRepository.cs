using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class DispositivoRepository : IDispositivoRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public DispositivoRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Dispositivo?> GetByIdAsync(int idDispositivo)
    {
        const string query = @"
            SELECT id_dispositivo, descripcion, email_funcionario
            FROM Dispositivo
            WHERE id_dispositivo = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idDispositivo);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return MapDispositivo(reader);
    }

    public async Task<List<Dispositivo>> GetAllAsync()
    {
        const string query = @"
            SELECT id_dispositivo, descripcion, email_funcionario
            FROM Dispositivo
            ORDER BY id_dispositivo";

        return await QueryListAsync(query);
    }

    public async Task<List<Dispositivo>> GetByFuncionarioAsync(string emailFuncionario)
    {
        const string query = @"
            SELECT id_dispositivo, descripcion, email_funcionario
            FROM Dispositivo
            WHERE email_funcionario = @email
            ORDER BY id_dispositivo";

        return await QueryListAsync(query, ("@email", emailFuncionario));
    }

    public async Task<bool> PerteneceAFuncionarioAsync(int idDispositivo, string emailFuncionario)
    {
        const string query = @"
            SELECT EXISTS(
                SELECT 1 FROM Dispositivo
                WHERE id_dispositivo = @id
                  AND email_funcionario = @email
            )";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idDispositivo);
        command.Parameters.AddWithValue("@email", emailFuncionario);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<int> CreateAsync(string descripcion, string emailFuncionario)
    {
        const string query = @"
            INSERT INTO Dispositivo (descripcion, email_funcionario)
            VALUES (@descripcion, @email)
            RETURNING id_dispositivo";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@descripcion", descripcion);
        command.Parameters.AddWithValue("@email", emailFuncionario);

        var result = await command.ExecuteScalarAsync();
        return (int)(result ?? 0);
    }

    public async Task<bool> DeleteAsync(int idDispositivo)
    {
        const string query = @"
            DELETE FROM Dispositivo
            WHERE id_dispositivo = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idDispositivo);

        return await command.ExecuteNonQueryAsync() > 0;
    }

    private async Task<List<Dispositivo>> QueryListAsync(string query, params (string Name, object Value)[] parameters)
    {
        var dispositivos = new List<Dispositivo>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        foreach (var (name, value) in parameters)
            command.Parameters.AddWithValue(name, value);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            dispositivos.Add(MapDispositivo(reader));

        return dispositivos;
    }

    private static Dispositivo MapDispositivo(NpgsqlDataReader reader) => new()
    {
        IdDispositivo = reader.GetInt32(0),
        Descripcion = reader.GetString(1),
        EmailFuncionario = reader.GetString(2)
    };
}
