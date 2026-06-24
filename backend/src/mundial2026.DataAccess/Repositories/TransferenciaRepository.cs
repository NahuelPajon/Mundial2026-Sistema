using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class TransferenciaRepository : ITransferenciaRepository
{
    private const string SelectTransferenciaBase = @"
        SELECT t.id_transferencia, t.id_entrada, t.email_origen, t.email_destino,
               t.fecha_solicitud, t.fecha_aceptacion, t.estado,
               h.orden,
               el.nombre, ev.nombre, ev_evento.fecha, est.nombre, e.codigo_sector
        FROM Transferencia t
        JOIN Entrada e ON e.id_entrada = t.id_entrada
        JOIN Evento ev_evento ON ev_evento.id_evento = e.id_evento
        JOIN Equipo el ON el.id_equipo = ev_evento.id_equipo_local
        JOIN Equipo ev ON ev.id_equipo = ev_evento.id_equipo_visitante
        JOIN Estadio est ON est.id_estadio = e.id_estadio
        LEFT JOIN Historial_Transferencia h
            ON h.id_transferencia = t.id_transferencia AND h.id_entrada = t.id_entrada";

    private readonly ConnectionFactory _connectionFactory;

    public TransferenciaRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Transferencia?> GetByIdAsync(int idTransferencia)
    {
        var query = SelectTransferenciaBase + " WHERE t.id_transferencia = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idTransferencia);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return MapTransferencia(reader);
    }

    public async Task<List<Transferencia>> GetByUsuarioAsync(string email, string? tipo = null)
    {
        var query = SelectTransferenciaBase + " WHERE ";
        query += tipo?.ToLowerInvariant() switch
        {
            "enviadas" => "t.email_origen = @email",
            "recibidas" => "t.email_destino = @email",
            _ => "(t.email_origen = @email OR t.email_destino = @email)"
        };
        query += " ORDER BY t.fecha_solicitud DESC";

        var transferencias = new List<Transferencia>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            transferencias.Add(MapTransferencia(reader));

        return transferencias;
    }

    public async Task<bool> HasPendingForEntradaAsync(int idEntrada)
    {
        const string query = @"
            SELECT EXISTS(
                SELECT 1 FROM Transferencia
                WHERE id_entrada = @id_entrada AND estado = 'pendiente'
            )";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_entrada", idEntrada);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<int> CountHistorialByEntradaAsync(int idEntrada)
    {
        const string query = @"
            SELECT COUNT(*)
            FROM Historial_Transferencia
            WHERE id_entrada = @id_entrada";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_entrada", idEntrada);

        return Convert.ToInt32(await command.ExecuteScalarAsync() ?? 0);
    }

    public async Task<int> CreateSolicitudAsync(int idEntrada, string emailOrigen, string emailDestino)
    {
        const string query = @"
            INSERT INTO Transferencia (id_entrada, email_origen, email_destino, fecha_solicitud, estado)
            VALUES (@id_entrada, @email_origen, @email_destino, @fecha_solicitud, 'pendiente')
            RETURNING id_transferencia";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_entrada", idEntrada);
        command.Parameters.AddWithValue("@email_origen", emailOrigen);
        command.Parameters.AddWithValue("@email_destino", emailDestino);
        command.Parameters.AddWithValue("@fecha_solicitud", DateTime.UtcNow);

        var result = await command.ExecuteScalarAsync();
        return (int)(result ?? 0);
    }

    public async Task<Transferencia> AceptarAsync(int idTransferencia, string emailDestino)
    {
        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            const string getTransferencia = @"
                SELECT id_entrada, email_destino, estado
                FROM Transferencia
                WHERE id_transferencia = @id
                FOR UPDATE";

            int idEntrada;
            string destino;
            string estado;
            using (var command = new NpgsqlCommand(getTransferencia, connection, transaction))
            {
                command.Parameters.AddWithValue("@id", idTransferencia);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    throw new KeyNotFoundException($"Transferencia {idTransferencia} no encontrada");

                idEntrada = reader.GetInt32(0);
                destino = reader.GetString(1);
                estado = reader.GetString(2);
            }

            if (!destino.Equals(emailDestino, StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("Solo el destinatario puede aceptar la transferencia");

            if (estado != "pendiente")
                throw new InvalidOperationException($"La transferencia ya fue {estado}");

            const string countHistorial = @"
                SELECT COUNT(*)
                FROM Historial_Transferencia
                WHERE id_entrada = @id_entrada";

            int transferenciasPrevias;
            using (var command = new NpgsqlCommand(countHistorial, connection, transaction))
            {
                command.Parameters.AddWithValue("@id_entrada", idEntrada);
                transferenciasPrevias = Convert.ToInt32(await command.ExecuteScalarAsync() ?? 0);
            }

            if (transferenciasPrevias >= 3)
                throw new InvalidOperationException("La entrada ya alcanzó el máximo de 3 transferencias");

            var nuevoOrden = transferenciasPrevias + 1;

            const string updateTransferencia = @"
                UPDATE Transferencia
                SET estado = 'aceptada', fecha_aceptacion = @fecha
                WHERE id_transferencia = @id";

            using (var command = new NpgsqlCommand(updateTransferencia, connection, transaction))
            {
                command.Parameters.AddWithValue("@id", idTransferencia);
                command.Parameters.AddWithValue("@fecha", DateTime.UtcNow);
                await command.ExecuteNonQueryAsync();
            }

            const string updateEntrada = @"
                UPDATE Entrada
                SET titular = @titular
                WHERE id_entrada = @id_entrada AND consumida = false";

            using (var command = new NpgsqlCommand(updateEntrada, connection, transaction))
            {
                command.Parameters.AddWithValue("@titular", emailDestino);
                command.Parameters.AddWithValue("@id_entrada", idEntrada);

                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0)
                    throw new InvalidOperationException("La entrada ya fue consumida y no puede transferirse");
            }

            const string insertHistorial = @"
                INSERT INTO Historial_Transferencia (id_entrada, id_transferencia, orden)
                VALUES (@id_entrada, @id_transferencia, @orden)";

            using (var command = new NpgsqlCommand(insertHistorial, connection, transaction))
            {
                command.Parameters.AddWithValue("@id_entrada", idEntrada);
                command.Parameters.AddWithValue("@id_transferencia", idTransferencia);
                command.Parameters.AddWithValue("@orden", nuevoOrden);
                await command.ExecuteNonQueryAsync();
            }

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return (await GetByIdAsync(idTransferencia))!;
    }

    public async Task<Transferencia> RechazarAsync(int idTransferencia, string emailDestino)
    {
        const string query = @"
            UPDATE Transferencia
            SET estado = 'rechazada', fecha_aceptacion = @fecha
            WHERE id_transferencia = @id
              AND email_destino = @email_destino
              AND estado = 'pendiente'
            RETURNING id_transferencia";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idTransferencia);
        command.Parameters.AddWithValue("@email_destino", emailDestino);
        command.Parameters.AddWithValue("@fecha", DateTime.UtcNow);

        var result = await command.ExecuteScalarAsync();
        if (result == null)
        {
            var existente = await GetByIdAsync(idTransferencia);
            if (existente == null)
                throw new KeyNotFoundException($"Transferencia {idTransferencia} no encontrada");
            if (!existente.EmailDestino.Equals(emailDestino, StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("Solo el destinatario puede rechazar la transferencia");
            throw new InvalidOperationException($"La transferencia ya fue {existente.Estado}");
        }

        return (await GetByIdAsync(idTransferencia))!;
    }

    private static Transferencia MapTransferencia(NpgsqlDataReader reader) => new()
    {
        IdTransferencia = reader.GetInt32(0),
        IdEntrada = reader.GetInt32(1),
        EmailOrigen = reader.GetString(2),
        EmailDestino = reader.GetString(3),
        FechaSolicitud = reader.GetDateTime(4),
        FechaAceptacion = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
        Estado = reader.GetString(6),
        OrdenHistorial = reader.IsDBNull(7) ? null : reader.GetInt32(7),
        EquipoLocalNombre = reader.GetString(8),
        EquipoVisitanteNombre = reader.GetString(9),
        EventoFecha = reader.GetDateTime(10),
        EstadioNombre = reader.GetString(11),
        CodigoSector = reader.GetString(12)
    };
}
