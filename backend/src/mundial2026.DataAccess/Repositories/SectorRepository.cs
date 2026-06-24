using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class SectorRepository : ISectorRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public SectorRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Sector?> GetBySectorAsync(int idEstadio, string codigo)
    {
        const string query = @"
            SELECT id_estadio, codigo, capacidad_maxima, costo
            FROM Sector
            WHERE id_estadio = @id_estadio AND codigo = @codigo";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);
        command.Parameters.AddWithValue("@codigo", codigo);

        Sector sector;
        using (var reader = await command.ExecuteReaderAsync())
        {
            if (!await reader.ReadAsync())
                return null;

            sector = new Sector
            {
                IdEstadio = reader.GetInt32(0),
                Codigo = reader.GetString(1),
                CapacidadMaxima = reader.GetInt32(2),
                Costo = reader.GetDecimal(3)
            };
        }

        sector.EntradasDisponibles = await GetEntradasDisponiblesAsync(idEstadio, codigo);
        return sector;
    }

    public async Task<List<Sector>> GetByEstadioIdAsync(int idEstadio)
    {
        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();
        return await GetBySectorByEstadioIdAsync(idEstadio, connection);
    }

    public async Task<List<Sector>> GetBySectorByEstadioIdAsync(int idEstadio, NpgsqlConnection connection)
    {
        const string query = @"
            SELECT id_estadio, codigo, capacidad_maxima, costo
            FROM Sector
            WHERE id_estadio = @id_estadio
            ORDER BY codigo";

        var sectores = new List<Sector>();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var sector = new Sector
            {
                IdEstadio = reader.GetInt32(0),
                Codigo = reader.GetString(1),
                CapacidadMaxima = reader.GetInt32(2),
                Costo = reader.GetDecimal(3)
            };

            sectores.Add(sector);
        }

        return sectores;
    }

    public async Task<bool> ExistsBySectorAsync(int idEstadio, string codigo)
    {
        const string query = @"
            SELECT EXISTS(SELECT 1 FROM Sector 
            WHERE id_estadio = @id_estadio AND codigo = @codigo)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);
        command.Parameters.AddWithValue("@codigo", codigo);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task CreateAsync(Sector sector)
    {
        const string query = @"
            INSERT INTO Sector (id_estadio, codigo, capacidad_maxima, costo)
            VALUES (@id_estadio, @codigo, @capacidad_maxima, @costo)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", sector.IdEstadio);
        command.Parameters.AddWithValue("@codigo", sector.Codigo);
        command.Parameters.AddWithValue("@capacidad_maxima", sector.CapacidadMaxima);
        command.Parameters.AddWithValue("@costo", sector.Costo);

        await command.ExecuteNonQueryAsync();
    }

    public async Task UpdateAsync(Sector sector)
    {
        const string query = @"
            UPDATE Sector 
            SET capacidad_maxima = @capacidad_maxima, costo = @costo
            WHERE id_estadio = @id_estadio AND codigo = @codigo";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", sector.IdEstadio);
        command.Parameters.AddWithValue("@codigo", sector.Codigo);
        command.Parameters.AddWithValue("@capacidad_maxima", sector.CapacidadMaxima);
        command.Parameters.AddWithValue("@costo", sector.Costo);

        await command.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(int idEstadio, string codigo)
    {
        const string query = @"
            DELETE FROM Sector 
            WHERE id_estadio = @id_estadio AND codigo = @codigo";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);
        command.Parameters.AddWithValue("@codigo", codigo);

        await command.ExecuteNonQueryAsync();
    }

    public async Task<int> GetEntradasDisponiblesAsync(int idEstadio, string codigo)
    {
        const string query = @"
            SELECT s.capacidad_maxima - COALESCE(COUNT(e.id_entrada), 0)
            FROM Sector s
            LEFT JOIN Entrada e ON e.id_estadio = s.id_estadio
                                 AND e.codigo_sector = s.codigo
                                 AND e.consumida = false
            WHERE s.id_estadio = @id_estadio AND s.codigo = @codigo
            GROUP BY s.capacidad_maxima";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);
        command.Parameters.AddWithValue("@codigo", codigo);

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result ?? 0);
    }

    public async Task<decimal?> GetCostoAsync(int idEstadio, string codigo)
    {
        const string query = @"
            SELECT costo
            FROM Sector
            WHERE id_estadio = @id_estadio AND codigo = @codigo";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id_estadio", idEstadio);
        command.Parameters.AddWithValue("@codigo", codigo);

        var result = await command.ExecuteScalarAsync();
        return result == null || result is DBNull ? null : (decimal)result;
    }
}
