using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class ValidacionRepository : IValidacionRepository
{
    private const string SelectValidacionBase = @"
        SELECT v.id_validacion, v.fecha, v.id_entrada, v.token_qr,
               v.id_dispositivo, v.email_funcionario,
               e.codigo_sector, est.nombre, el.nombre, ev.nombre
        FROM Validacion v
        JOIN Entrada e ON e.id_entrada = v.id_entrada
        JOIN Evento ev_evento ON ev_evento.id_evento = e.id_evento
        JOIN Equipo el ON el.id_equipo = ev_evento.id_equipo_local
        JOIN Equipo ev ON ev.id_equipo = ev_evento.id_equipo_visitante
        JOIN Estadio est ON est.id_estadio = e.id_estadio";

    private readonly ConnectionFactory _connectionFactory;

    public ValidacionRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Validacion?> GetByIdAsync(int idValidacion)
    {
        var query = SelectValidacionBase + " WHERE v.id_validacion = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idValidacion);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return MapValidacion(reader);
    }

    public async Task<List<Validacion>> GetByFuncionarioAsync(string emailFuncionario)
    {
        var query = SelectValidacionBase + @"
            WHERE v.email_funcionario = @email
            ORDER BY v.fecha DESC";

        var validaciones = new List<Validacion>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", emailFuncionario);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            validaciones.Add(MapValidacion(reader));

        return validaciones;
    }

    public async Task<int> CountByFuncionarioAsync(string emailFuncionario)
    {
        const string query = @"
            SELECT COUNT(*)
            FROM Validacion
            WHERE email_funcionario = @email";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", emailFuncionario);

        return Convert.ToInt32(await command.ExecuteScalarAsync() ?? 0);
    }

    public async Task<Validacion> RegistrarEscaneoAsync(
        string token,
        int idDispositivo,
        string emailFuncionario)
    {
        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            const string lockQr = @"
                SELECT q.id_entrada, q.activo, e.consumida, e.codigo_sector,
                       (q.expira_en > NOW()) AS vigente
                FROM QR q
                JOIN Entrada e ON e.id_entrada = q.id_entrada
                WHERE q.token = @token
                FOR UPDATE OF q, e";

            int idEntrada;
            bool qrActivo;
            bool consumida;
            bool vigente;
            string codigoSector;

            using (var command = new NpgsqlCommand(lockQr, connection, transaction))
            {
                command.Parameters.AddWithValue("@token", token);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    throw new KeyNotFoundException("Código QR no reconocido");

                idEntrada = reader.GetInt32(0);
                qrActivo = reader.GetBoolean(1);
                consumida = reader.GetBoolean(2);
                codigoSector = reader.GetString(3);
                vigente = reader.GetBoolean(4);
            }

            if (consumida)
                throw new InvalidOperationException("La entrada ya fue consumida");

            if (!qrActivo || !vigente)
                throw new InvalidOperationException("El código QR expiró o ya no es válido");

            const string verificarDispositivo = @"
                SELECT EXISTS(
                    SELECT 1 FROM Dispositivo
                    WHERE id_dispositivo = @id_dispositivo
                      AND email_funcionario = @email_funcionario
                )";

            bool dispositivoAutorizado;
            using (var command = new NpgsqlCommand(verificarDispositivo, connection, transaction))
            {
                command.Parameters.AddWithValue("@id_dispositivo", idDispositivo);
                command.Parameters.AddWithValue("@email_funcionario", emailFuncionario);
                dispositivoAutorizado = (bool)(await command.ExecuteScalarAsync() ?? false);
            }

            if (!dispositivoAutorizado)
                throw new UnauthorizedAccessException("Dispositivo no autorizado para este funcionario");

            const string insertValidacion = @"
                INSERT INTO Validacion (fecha, id_entrada, token_qr, id_dispositivo, email_funcionario)
                VALUES (@fecha, @id_entrada, @token, @id_dispositivo, @email_funcionario)
                RETURNING id_validacion";

            int idValidacion;
            using (var command = new NpgsqlCommand(insertValidacion, connection, transaction))
            {
                command.Parameters.AddWithValue("@fecha", DateTime.UtcNow);
                command.Parameters.AddWithValue("@id_entrada", idEntrada);
                command.Parameters.AddWithValue("@token", token);
                command.Parameters.AddWithValue("@id_dispositivo", idDispositivo);
                command.Parameters.AddWithValue("@email_funcionario", emailFuncionario);

                idValidacion = (int)(await command.ExecuteScalarAsync() ?? 0);
            }

            const string marcarConsumida = @"
                UPDATE Entrada
                SET consumida = TRUE
                WHERE id_entrada = @id_entrada AND consumida = FALSE";

            using (var command = new NpgsqlCommand(marcarConsumida, connection, transaction))
            {
                command.Parameters.AddWithValue("@id_entrada", idEntrada);
                var rows = await command.ExecuteNonQueryAsync();
                if (rows == 0)
                    throw new InvalidOperationException("La entrada ya fue consumida");
            }

            const string desactivarQr = @"
                UPDATE QR
                SET activo = FALSE
                WHERE token = @token";

            using (var command = new NpgsqlCommand(desactivarQr, connection, transaction))
            {
                command.Parameters.AddWithValue("@token", token);
                await command.ExecuteNonQueryAsync();
            }

            await transaction.CommitAsync();

            return (await GetByIdAsync(idValidacion))!;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static Validacion MapValidacion(NpgsqlDataReader reader) => new()
    {
        IdValidacion = reader.GetInt32(0),
        Fecha = reader.GetDateTime(1),
        IdEntrada = reader.GetInt32(2),
        TokenQr = reader.GetString(3),
        IdDispositivo = reader.GetInt32(4),
        EmailFuncionario = reader.GetString(5),
        CodigoSector = reader.GetString(6),
        EstadioNombre = reader.GetString(7),
        EquipoLocalNombre = reader.GetString(8),
        EquipoVisitanteNombre = reader.GetString(9)
    };
}
