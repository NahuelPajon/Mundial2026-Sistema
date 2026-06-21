using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class EquipoRepository : IEquipoRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public EquipoRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Equipo?> GetByIdAsync(int idEquipo)
    {
        const string query = @"
            SELECT id_equipo, nombre, pais
            FROM Equipo
            WHERE id_equipo = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEquipo);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return MapEquipo(reader);
    }

    public async Task<List<Equipo>> GetAllAsync()
    {
        const string query = @"
            SELECT id_equipo, nombre, pais
            FROM Equipo
            ORDER BY nombre";

        var equipos = new List<Equipo>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
            equipos.Add(MapEquipo(reader));

        return equipos;
    }

    public async Task<bool> ExistsByIdAsync(int idEquipo)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Equipo WHERE id_equipo = @id)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEquipo);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null)
    {
        const string query = @"
            SELECT EXISTS(
                SELECT 1 FROM Equipo
                WHERE LOWER(nombre) = LOWER(@nombre)
                  AND (@exclude_id IS NULL OR id_equipo <> @exclude_id)
            )";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@nombre", nombre);
        command.Parameters.AddWithValue("@exclude_id", (object?)excludeId ?? DBNull.Value);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<bool> IsUsedInEventoAsync(int idEquipo)
    {
        const string query = @"
            SELECT EXISTS(
                SELECT 1 FROM Evento
                WHERE id_equipo_local = @id OR id_equipo_visitante = @id
            )";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEquipo);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<int> CreateAsync(Equipo equipo)
    {
        const string query = @"
            INSERT INTO Equipo (nombre, pais)
            VALUES (@nombre, @pais)
            RETURNING id_equipo";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@nombre", equipo.Nombre);
        command.Parameters.AddWithValue("@pais", equipo.Pais);

        var result = await command.ExecuteScalarAsync();
        return (int)(result ?? 0);
    }

    public async Task UpdateAsync(Equipo equipo)
    {
        const string query = @"
            UPDATE Equipo
            SET nombre = @nombre, pais = @pais
            WHERE id_equipo = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", equipo.IdEquipo);
        command.Parameters.AddWithValue("@nombre", equipo.Nombre);
        command.Parameters.AddWithValue("@pais", equipo.Pais);

        await command.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(int idEquipo)
    {
        const string query = "DELETE FROM Equipo WHERE id_equipo = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEquipo);

        await command.ExecuteNonQueryAsync();
    }

    private static Equipo MapEquipo(NpgsqlDataReader reader) => new()
    {
        IdEquipo = reader.GetInt32(0),
        Nombre = reader.GetString(1),
        Pais = reader.GetString(2)
    };
}
