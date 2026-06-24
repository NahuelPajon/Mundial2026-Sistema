using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class VentaRepository : IVentaRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public VentaRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Venta?> GetByIdAsync(int idVenta)
    {
        const string query = @"
            SELECT v.id_venta, v.fecha, v.estado, v.monto_total, v.cantidad_comprada,
                   v.email_usuario, v.id_tasa, t.porcentaje
            FROM Venta v
            JOIN Tasa_Comision t ON t.id_tasa = v.id_tasa
            WHERE v.id_venta = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        Venta venta;
        using (var command = new NpgsqlCommand(query, connection))
        {
            command.Parameters.AddWithValue("@id", idVenta);

            using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            venta = MapVenta(reader);
        }

        venta.Entradas = await GetEntradasByVentaAsync(idVenta, connection);
        return venta;
    }

    public async Task<List<Venta>> GetByUsuarioAsync(string emailUsuario)
    {
        const string query = @"
            SELECT v.id_venta, v.fecha, v.estado, v.monto_total, v.cantidad_comprada,
                   v.email_usuario, v.id_tasa, t.porcentaje
            FROM Venta v
            JOIN Tasa_Comision t ON t.id_tasa = v.id_tasa
            WHERE v.email_usuario = @email
            ORDER BY v.fecha DESC";

        var ventas = new List<Venta>();

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using (var command = new NpgsqlCommand(query, connection))
        {
            command.Parameters.AddWithValue("@email", emailUsuario);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                ventas.Add(MapVenta(reader));
        }

        foreach (var venta in ventas)
            venta.Entradas = await GetEntradasByVentaAsync(venta.IdVenta, connection);

        return ventas;
    }

    public async Task<Venta> CreateWithEntradasAsync(
        string emailUsuario,
        int idTasa,
        decimal porcentajeComision,
        decimal montoTotal,
        decimal subtotal,
        IReadOnlyList<CompraEntradaItem> items)
    {
        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            var demandaPorSector = items
                .GroupBy(i => (i.IdEstadio, i.CodigoSector))
                .ToDictionary(g => g.Key, g => g.Count());

            foreach (var ((idEstadio, codigoSector), cantidad) in demandaPorSector)
            {
                await ValidarCapacidadSectorAsync(
                    connection, transaction, idEstadio, codigoSector, cantidad);
            }

            const string insertVenta = @"
                INSERT INTO Venta (fecha, estado, monto_total, cantidad_comprada, email_usuario, id_tasa)
                VALUES (@fecha, 'paga', @monto_total, @cantidad, @email, @id_tasa)
                RETURNING id_venta, fecha";

            int idVenta;
            DateTime fechaVenta;
            using (var command = new NpgsqlCommand(insertVenta, connection, transaction))
            {
                command.Parameters.AddWithValue("@fecha", DateTime.UtcNow);
                command.Parameters.AddWithValue("@monto_total", montoTotal);
                command.Parameters.AddWithValue("@cantidad", items.Count);
                command.Parameters.AddWithValue("@email", emailUsuario);
                command.Parameters.AddWithValue("@id_tasa", idTasa);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    throw new InvalidOperationException("No se pudo crear la venta");

                idVenta = reader.GetInt32(0);
                fechaVenta = reader.GetDateTime(1);
            }

            const string insertEntrada = @"
                INSERT INTO Entrada (titular, id_venta, id_evento, id_estadio, codigo_sector, consumida)
                VALUES (@titular, @id_venta, @id_evento, @id_estadio, @codigo_sector, false)
                RETURNING id_entrada";

            foreach (var item in items)
            {
                using var command = new NpgsqlCommand(insertEntrada, connection, transaction);
                command.Parameters.AddWithValue("@titular", emailUsuario);
                command.Parameters.AddWithValue("@id_venta", idVenta);
                command.Parameters.AddWithValue("@id_evento", item.IdEvento);
                command.Parameters.AddWithValue("@id_estadio", item.IdEstadio);
                command.Parameters.AddWithValue("@codigo_sector", item.CodigoSector);
                await command.ExecuteScalarAsync();
            }

            await transaction.CommitAsync();

            var entradas = await GetEntradasByVentaAsync(idVenta, connection);

            return new Venta
            {
                IdVenta = idVenta,
                Fecha = fechaVenta,
                Estado = "paga",
                MontoTotal = montoTotal,
                CantidadComprada = items.Count,
                EmailUsuario = emailUsuario,
                IdTasa = idTasa,
                PorcentajeComision = porcentajeComision,
                Entradas = entradas
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static async Task ValidarCapacidadSectorAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction transaction,
        int idEstadio,
        string codigoSector,
        int cantidadSolicitada)
    {
        const string lockSector = @"
            SELECT capacidad_maxima
            FROM Sector
            WHERE id_estadio = @id_estadio AND codigo = @codigo
            FOR UPDATE";

        int capacidadMaxima;
        using (var command = new NpgsqlCommand(lockSector, connection, transaction))
        {
            command.Parameters.AddWithValue("@id_estadio", idEstadio);
            command.Parameters.AddWithValue("@codigo", codigoSector);

            var result = await command.ExecuteScalarAsync();
            if (result == null)
                throw new InvalidOperationException(
                    $"Sector {codigoSector} no existe en el estadio {idEstadio}");

            capacidadMaxima = Convert.ToInt32(result);
        }

        const string countEntradas = @"
            SELECT COUNT(*)
            FROM Entrada
            WHERE id_estadio = @id_estadio
              AND codigo_sector = @codigo
              AND id_evento = @id_evento
              AND consumida = false";

        int entradasEmitidas;
        using (var command = new NpgsqlCommand(countEntradas, connection, transaction))
        {
            command.Parameters.AddWithValue("@id_estadio", idEstadio);
            command.Parameters.AddWithValue("@codigo", codigoSector);

            entradasEmitidas = Convert.ToInt32(await command.ExecuteScalarAsync() ?? 0);
        }

        var disponibles = capacidadMaxima - entradasEmitidas;
        if (cantidadSolicitada > disponibles)
        {
            throw new InvalidOperationException(
                $"Capacidad insuficiente en sector {codigoSector}: disponibles {disponibles}, solicitadas {cantidadSolicitada}");
        }
    }

    private static async Task<List<Entrada>> GetEntradasByVentaAsync(int idVenta, NpgsqlConnection connection)
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
            WHERE e.id_venta = @id_venta
            ORDER BY e.id_entrada";

        var entradas = new List<Entrada>();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_venta", idVenta);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            entradas.Add(new Entrada
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
                Costo = reader.GetDecimal(11)
            });
        }

        return entradas;
    }

    private static Venta MapVenta(NpgsqlDataReader reader) => new()
    {
        IdVenta = reader.GetInt32(0),
        Fecha = reader.GetDateTime(1),
        Estado = reader.GetString(2),
        MontoTotal = reader.GetDecimal(3),
        CantidadComprada = reader.GetInt32(4),
        EmailUsuario = reader.GetString(5),
        IdTasa = reader.GetInt32(6),
        PorcentajeComision = reader.GetDecimal(7)
    };
}
