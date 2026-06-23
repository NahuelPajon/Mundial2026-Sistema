using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class TasaComisionRepository : ITasaComisionRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public TasaComisionRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<TasaComision?> GetVigenteAsync(DateTime fecha)
    {
        const string query = @"
            SELECT id_tasa, porcentaje, fecha_desde, fecha_hasta
            FROM Tasa_Comision
            WHERE fecha_desde <= @fecha
              AND (fecha_hasta IS NULL OR fecha_hasta >= @fecha)
            ORDER BY fecha_desde DESC
            LIMIT 1";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@fecha", fecha.Date);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return new TasaComision
        {
            IdTasa = reader.GetInt32(0),
            Porcentaje = reader.GetDecimal(1),
            FechaDesde = reader.GetDateTime(2),
            FechaHasta = reader.IsDBNull(3) ? null : reader.GetDateTime(3)
        };
    }
}
