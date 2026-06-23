using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class EventoRepository : IEventoRepository
{
    private const int DuracionHorasSolapamiento = 3;

    private readonly ConnectionFactory _connectionFactory;

    private const string SelectEventoBase = @"
        SELECT e.id_evento, e.fecha, e.estado, e.id_estadio, e.email_admin,
               e.id_equipo_local, e.id_equipo_visitante,
               est.nombre, el.nombre, ev.nombre
        FROM Evento e
        JOIN Estadio est ON est.id_estadio = e.id_estadio
        JOIN Equipo el ON el.id_equipo = e.id_equipo_local
        JOIN Equipo ev ON ev.id_equipo = e.id_equipo_visitante";

    public EventoRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Evento?> GetByIdAsync(int idEvento)
    {
        var query = SelectEventoBase + " WHERE e.id_evento = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        Evento evento;
        using (var command = new NpgsqlCommand(query, connection))
        {
            command.Parameters.AddWithValue("@id", idEvento);

            using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            evento = MapEvento(reader);
        }

        evento.SectoresHabilitados = await GetSectoresHabilitadosAsync(idEvento, connection);
        return evento;
    }

    public async Task<List<Evento>> GetAllAsync(int? idEstadio = null)
    {
        var query = SelectEventoBase;
        if (idEstadio.HasValue)
            query += " WHERE e.id_estadio = @id_estadio";
        query += " ORDER BY e.fecha";

        var eventos = new List<Evento>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using (var command = new NpgsqlCommand(query, connection))
        {
            if (idEstadio.HasValue)
                command.Parameters.AddWithValue("@id_estadio", idEstadio.Value);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                eventos.Add(MapEvento(reader));
        }

        foreach (var evento in eventos)
        {
            evento.SectoresHabilitados = await GetSectoresHabilitadosAsync(evento.IdEvento, connection);
        }

        return eventos;
    }

    public async Task<bool> ExistsByIdAsync(int idEvento)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Evento WHERE id_evento = @id)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEvento);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<bool> HasOverlappingEventAsync(int idEstadio, DateTime fecha, int? excludeEventoId = null)
    {
        const string query = @"
            SELECT EXISTS(
                SELECT 1
                FROM Evento e
                WHERE e.id_estadio = @id_estadio
                  AND (@exclude_id::integer IS NULL OR e.id_evento <> @exclude_id)
                  AND e.fecha < @fecha + (@duracion_horas * INTERVAL '1 hour')
                  AND e.fecha + (@duracion_horas * INTERVAL '1 hour') > @fecha
            )";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);
        command.Parameters.AddWithValue("@fecha", fecha);
        command.Parameters.AddWithValue("@duracion_horas", DuracionHorasSolapamiento);

        var paramExcludeId = new NpgsqlParameter("@exclude_id", NpgsqlTypes.NpgsqlDbType.Integer)
        {
            Value = (object?)excludeEventoId ?? DBNull.Value
        };
        command.Parameters.AddWithValue("@exclude_id", (object?)excludeEventoId ?? DBNull.Value);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<bool> AllSectoresExistInEstadioAsync(int idEstadio, IReadOnlyList<string> codigosSectores)
    {
        if (codigosSectores.Count == 0)
            return false;

        const string query = @"
            SELECT COUNT(*)
            FROM Sector
            WHERE id_estadio = @id_estadio
              AND codigo = ANY(@codigos)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);
        command.Parameters.AddWithValue("@codigos", codigosSectores.ToArray());

        var result = await command.ExecuteScalarAsync();
        var count = Convert.ToInt32(result ?? 0);
        return count == codigosSectores.Count;
    }

    public async Task<int> CreateAsync(Evento evento, IReadOnlyList<string> codigosSectores)
    {
        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            const string insertEvento = @"
                INSERT INTO Evento (fecha, estado, id_estadio, email_admin, id_equipo_local, id_equipo_visitante)
                VALUES (@fecha, @estado, @id_estadio, @email_admin, @id_equipo_local, @id_equipo_visitante)
                RETURNING id_evento";

            int idEvento;
            using (var command = new NpgsqlCommand(insertEvento, connection, transaction))
            {
                command.Parameters.AddWithValue("@fecha", evento.Fecha);
                command.Parameters.AddWithValue("@estado", evento.Estado);
                command.Parameters.AddWithValue("@id_estadio", evento.IdEstadio);
                command.Parameters.AddWithValue("@email_admin", evento.EmailAdmin);
                command.Parameters.AddWithValue("@id_equipo_local", evento.IdEquipoLocal);
                command.Parameters.AddWithValue("@id_equipo_visitante", evento.IdEquipoVisitante);

                var result = await command.ExecuteScalarAsync();
                idEvento = Convert.ToInt32(result ?? 0);
            }

            const string insertSector = @"
                INSERT INTO Evento_Sector (id_evento, id_estadio, codigo_sector)
                VALUES (@id_evento, @id_estadio, @codigo_sector)";

            foreach (var codigo in codigosSectores)
            {
                using var command = new NpgsqlCommand(insertSector, connection, transaction);
                command.Parameters.AddWithValue("@id_evento", idEvento);
                command.Parameters.AddWithValue("@id_estadio", evento.IdEstadio);
                command.Parameters.AddWithValue("@codigo_sector", codigo);
                await command.ExecuteNonQueryAsync();
            }

            await transaction.CommitAsync();
            return idEvento;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static Evento MapEvento(NpgsqlDataReader reader) => new()
    {
        IdEvento = reader.GetInt32(0),
        Fecha = reader.GetDateTime(1),
        Estado = reader.GetString(2),
        IdEstadio = reader.GetInt32(3),
        EmailAdmin = reader.GetString(4),
        IdEquipoLocal = reader.GetInt32(5),
        IdEquipoVisitante = reader.GetInt32(6),
        EstadioNombre = reader.GetString(7),
        EquipoLocalNombre = reader.GetString(8),
        EquipoVisitanteNombre = reader.GetString(9)
    };

    private static async Task<List<string>> GetSectoresHabilitadosAsync(int idEvento, NpgsqlConnection connection)
    {
        const string query = @"
            SELECT codigo_sector
            FROM Evento_Sector
            WHERE id_evento = @id_evento
            ORDER BY codigo_sector";

        var sectores = new List<string>();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_evento", idEvento);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            sectores.Add(reader.GetString(0));

        return sectores;
    }

    public async Task<(int IdEstadio, string Estado)?> GetEstadioInfoAsync(int idEvento)
    {
        const string query = @"
            SELECT id_estadio, estado
            FROM Evento
            WHERE id_evento = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEvento);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return (reader.GetInt32(0), reader.GetString(1));
    }

    public async Task<bool> IsSectorHabilitadoAsync(int idEvento, int idEstadio, string codigoSector)
    {
        const string query = @"
            SELECT EXISTS(
                SELECT 1 FROM Evento_Sector
                WHERE id_evento = @id_evento
                  AND id_estadio = @id_estadio
                  AND codigo_sector = @codigo_sector
            )";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_evento", idEvento);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);
        command.Parameters.AddWithValue("@codigo_sector", codigoSector);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }
}
