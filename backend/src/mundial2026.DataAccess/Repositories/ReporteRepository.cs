using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class ReporteRepository : IReporteRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public ReporteRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<EntradaAsignada>> GetEntradasAsignadasByUsuarioAsync(string email)
    {
        const string query = @"
            SELECT
                e.id_entrada,
                ev.id_evento,
                el.nombre,
                ev2.nombre,
                ev.fecha,
                est.nombre,
                e.codigo_sector,
                s.costo,
                e.consumida
            FROM Entrada e
            JOIN Evento ev ON ev.id_evento = e.id_evento
            JOIN Equipo el ON el.id_equipo = ev.id_equipo_local
            JOIN Equipo ev2 ON ev2.id_equipo = ev.id_equipo_visitante
            JOIN Estadio est ON est.id_estadio = e.id_estadio
            JOIN Sector s ON s.id_estadio = e.id_estadio AND s.codigo = e.codigo_sector
            WHERE e.titular = @email
            ORDER BY ev.fecha";

        var entradas = new List<EntradaAsignada>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            entradas.Add(new EntradaAsignada
            {
                IdEntrada = reader.GetInt32(0),
                IdEvento = reader.GetInt32(1),
                EquipoLocalNombre = reader.GetString(2),
                EquipoVisitanteNombre = reader.GetString(3),
                EventoFecha = reader.GetDateTime(4),
                EstadioNombre = reader.GetString(5),
                CodigoSector = reader.GetString(6),
                Costo = reader.GetDecimal(7),
                Consumida = reader.GetBoolean(8)
            });
        }

        return entradas;
    }

    public async Task<List<RankingComprador>> GetRankingCompradoresAsync(int limit = 10)
    {
        const string query = @"
            SELECT
                u.email_perfil,
                COUNT(e.id_entrada) AS cantidad_entradas_compradas,
                COALESCE((
                    SELECT SUM(v2.monto_total)
                    FROM Venta v2
                    WHERE v2.email_usuario = u.email_perfil AND v2.estado = 'paga'
                ), 0) AS monto_total_gastado
            FROM Usuario u
            JOIN Venta v ON v.email_usuario = u.email_perfil AND v.estado = 'paga'
            JOIN Entrada e ON e.id_venta = v.id_venta
            GROUP BY u.email_perfil
            ORDER BY cantidad_entradas_compradas DESC, monto_total_gastado DESC
            LIMIT @limit";

        var ranking = new List<RankingComprador>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@limit", limit);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            ranking.Add(new RankingComprador
            {
                Email = reader.GetString(0),
                CantidadEntradasCompradas = reader.GetInt32(1),
                MontoTotalGastado = reader.GetDecimal(2)
            });
        }

        return ranking;
    }

    public async Task<List<EventoMasVendido>> GetEventosMasVendidosAsync(int limit = 10)
    {
        const string query = @"
            SELECT
                ev.id_evento,
                el.nombre,
                ev2.nombre,
                ev.fecha,
                est.nombre,
                (SELECT COUNT(*) FROM Entrada e WHERE e.id_evento = ev.id_evento) AS entradas_vendidas,
                COALESCE((
                    SELECT SUM(s.capacidad_maxima)
                    FROM Evento_Sector es
                    JOIN Sector s ON s.id_estadio = es.id_estadio AND s.codigo = es.codigo_sector
                    WHERE es.id_evento = ev.id_evento
                ), 0) AS capacidad_total
            FROM Evento ev
            JOIN Equipo el ON el.id_equipo = ev.id_equipo_local
            JOIN Equipo ev2 ON ev2.id_equipo = ev.id_equipo_visitante
            JOIN Estadio est ON est.id_estadio = ev.id_estadio
            ORDER BY entradas_vendidas DESC
            LIMIT @limit";

        var eventos = new List<EventoMasVendido>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@limit", limit);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            eventos.Add(new EventoMasVendido
            {
                IdEvento = reader.GetInt32(0),
                EquipoLocalNombre = reader.GetString(1),
                EquipoVisitanteNombre = reader.GetString(2),
                Fecha = reader.GetDateTime(3),
                EstadioNombre = reader.GetString(4),
                EntradasVendidas = reader.GetInt32(5),
                CapacidadTotal = reader.GetInt32(6)
            });
        }

        return eventos;
    }

    public async Task<ResumenSistema> GetResumenSistemaAsync()
    {
        const string query = @"
            SELECT
                (SELECT COUNT(*) FROM Entrada) AS total_entradas,
                (SELECT COALESCE(SUM(monto_total), 0) FROM Venta WHERE estado = 'paga') AS recaudacion,
                (SELECT COALESCE(porcentaje, 5) FROM Tasa_Comision
                 WHERE fecha_desde <= CURRENT_DATE
                   AND (fecha_hasta IS NULL OR fecha_hasta >= CURRENT_DATE)
                 ORDER BY fecha_desde DESC LIMIT 1) AS comision,
                (SELECT COUNT(DISTINCT id_estadio) FROM Evento) AS estadios_activos,
                (SELECT COUNT(*) FROM Estadio) AS total_estadios";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();
        await reader.ReadAsync();

        return new ResumenSistema
        {
            TotalEntradasVendidas = reader.GetInt32(0),
            RecaudacionTotal = reader.GetDecimal(1),
            PorcentajeComision = reader.GetDecimal(2),
            EstadiosActivos = reader.GetInt32(3),
            TotalEstadios = reader.GetInt32(4)
        };
    }
}
