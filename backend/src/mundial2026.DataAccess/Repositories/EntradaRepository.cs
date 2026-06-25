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

    public async Task<Entrada?> GetDetalleByIdAsync(int idEntrada)
    {
        const string query = @"
            SELECT e.id_entrada, e.titular, e.id_venta, e.id_evento, e.id_estadio,
                   e.codigo_sector, e.consumida,
                   el.nombre, ev.nombre, ev_evento.fecha, est.nombre, s.costo
            FROM Entrada e
            JOIN Evento ev_evento ON ev_evento.id_evento = e.id_evento
            JOIN Equipo el ON el.id_equipo = ev_evento.id_equipo_local
            JOIN Equipo ev ON ev.id_equipo = ev_evento.id_equipo_visitante
            JOIN Estadio est ON est.id_estadio = e.id_estadio
            JOIN Sector s ON s.id_estadio = e.id_estadio AND s.codigo = e.codigo_sector
            WHERE e.id_entrada = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEntrada);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return MapEntrada(reader);
    }

    public async Task<List<Entrada>> GetActivasByTitularAsync(string emailTitular)
    {
        // Solo muestra entradas de partidos que aún no terminaron.
        // Se usa NOW() - INTERVAL '2 hours' como margen: un partido dura ~2 horas,
        // así que si hace más de 2 horas que comenzó, ya pasó y la entrada desaparece.
        const string query = @"
            SELECT e.id_entrada, e.titular, e.id_venta, e.id_evento, e.id_estadio,
                e.codigo_sector, e.consumida,
                el.nombre, ev.nombre, ev_evento.fecha, est.nombre, s.costo,
                (SELECT COUNT(*) FROM Historial_Transferencia h WHERE h.id_entrada = e.id_entrada) AS veces_transferida
            FROM Entrada e      
            JOIN Evento ev_evento ON ev_evento.id_evento = e.id_evento
            JOIN Equipo el ON el.id_equipo = ev_evento.id_equipo_local
            JOIN Equipo ev ON ev.id_equipo = ev_evento.id_equipo_visitante
            JOIN Estadio est ON est.id_estadio = e.id_estadio
            JOIN Sector s ON s.id_estadio = e.id_estadio AND s.codigo = e.codigo_sector
            WHERE e.titular = @email
              AND e.consumida = FALSE
              AND ev_evento.fecha >= NOW() - INTERVAL '2 hours'
            ORDER BY ev_evento.fecha ASC";

        var entradas = new List<Entrada>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", emailTitular);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            entradas.Add(MapEntrada(reader));

        return entradas;
    }

    public async Task<bool> IsTitularAsync(int idEntrada, string emailTitular)
    {
        const string query = @"
            SELECT EXISTS(
                SELECT 1 FROM Entrada
                WHERE id_entrada = @id AND titular = @email
            )";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEntrada);
        command.Parameters.AddWithValue("@email", emailTitular);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    private static Entrada MapEntrada(NpgsqlDataReader reader) => new()
    {
        IdEntrada = reader.GetInt32(0),
        Titular = reader.GetString(1),
        IdVenta = reader.GetInt32(2),
        IdEvento = reader.GetInt32(3),
        IdEstadio = reader.GetInt32(4),
        CodigoSector = reader.GetString(5),
        Consumida = reader.GetBoolean(6),
        EquipoLocalNombre = reader.GetString(7),
        EquipoVisitanteNombre = reader.GetString(8),
        EventoFecha = reader.GetDateTime(9),
        EstadioNombre = reader.GetString(10),
        Costo = reader.GetDecimal(11),
        VecesTransferida = reader.FieldCount > 12 ? Convert.ToInt32(reader.GetValue(12)) : 0
    };
}