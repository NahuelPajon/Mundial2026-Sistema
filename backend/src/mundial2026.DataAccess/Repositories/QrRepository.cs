using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class QrRepository : IQrRepository
{
    private const int ValidezSegundos = 30;

    private readonly ConnectionFactory _connectionFactory;

    public QrRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Qr?> GetActivoVigenteByEntradaAsync(int idEntrada)
    {
        const string query = @"
            SELECT token, id_entrada, generado_en, expira_en, activo
            FROM QR
            WHERE id_entrada = @id_entrada
              AND activo = TRUE
              AND expira_en > NOW()
            ORDER BY generado_en DESC
            LIMIT 1";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_entrada", idEntrada);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return MapQr(reader);
    }

    public async Task<Qr> RotarTokenAsync(int idEntrada)
    {
        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            const string desactivarAnteriores = @"
                UPDATE QR
                SET activo = FALSE
                WHERE id_entrada = @id_entrada AND activo = TRUE";

            using (var command = new NpgsqlCommand(desactivarAnteriores, connection, transaction))
            {
                command.Parameters.AddWithValue("@id_entrada", idEntrada);
                await command.ExecuteNonQueryAsync();
            }

            const string insertarNuevo = @"
                INSERT INTO QR (token, id_entrada, generado_en, expira_en, activo)
                VALUES (
                    encode(gen_random_bytes(32), 'hex'),
                    @id_entrada,
                    NOW(),
                    NOW() + (@validez_segundos || ' seconds')::INTERVAL,
                    TRUE
                )
                RETURNING token, id_entrada, generado_en, expira_en, activo";

            Qr qr;
            using (var command = new NpgsqlCommand(insertarNuevo, connection, transaction))
            {
                command.Parameters.AddWithValue("@id_entrada", idEntrada);
                command.Parameters.AddWithValue("@validez_segundos", ValidezSegundos);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    throw new InvalidOperationException("No se pudo generar el token QR");

                qr = MapQr(reader);
            }

            await transaction.CommitAsync();
            return qr;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static Qr MapQr(NpgsqlDataReader reader) => new()
    {
        Token = reader.GetString(0),
        IdEntrada = reader.GetInt32(1),
        GeneradoEn = reader.GetDateTime(2),
        ExpiraEn = reader.GetDateTime(3),
        Activo = reader.GetBoolean(4)
    };
}
