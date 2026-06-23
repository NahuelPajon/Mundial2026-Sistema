using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class EntradaRepository : IEntradaRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public EntradaRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<EntradaResumen?> GetResumenByIdAsync(int idEntrada)
    {
        const string query = @"
            SELECT id_entrada, titular, consumida, id_evento, codigo_sector
            FROM Entrada
            WHERE id_entrada = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEntrada);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return new EntradaResumen
        {
            IdEntrada = reader.GetInt32(0),
            Titular = reader.GetString(1),
            Consumida = reader.GetBoolean(2),
            IdEvento = reader.GetInt32(3),
            CodigoSector = reader.GetString(4)
        };
    }

    public async Task<bool> ExistsByIdAsync(int idEntrada)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Entrada WHERE id_entrada = @id)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEntrada);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }
}
