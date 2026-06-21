using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class EstadioRepository : IEstadioRepository
{
    private readonly ConnectionFactory _connectionFactory;
    private readonly ISectorRepository _sectorRepository;

    public EstadioRepository(ConnectionFactory connectionFactory, ISectorRepository sectorRepository)
    {
        _connectionFactory = connectionFactory;
        _sectorRepository = sectorRepository;
    }

    public async Task<Estadio?> GetByIdAsync(int idEstadio)
    {
        const string query = @"
            SELECT id_estadio, nombre, aforo, pais_dir, localidad, calle, numero_dir
            FROM Estadio
            WHERE id_estadio = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEstadio);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        var estadio = new Estadio
        {
            IdEstadio = reader.GetInt32(0),
            Nombre = reader.GetString(1),
            Aforo = reader.GetInt32(2),
            PaisDir = reader.GetString(3),
            Localidad = reader.GetString(4),
            Calle = reader.GetString(5),
            NumeroDir = reader.GetString(6)
        };

        await reader.CloseAsync();

        estadio.Sectores = await _sectorRepository.GetByEstadioIdAsync(idEstadio);
        foreach (var sector in estadio.Sectores)
        {
            sector.EntradasDisponibles = await _sectorRepository.GetEntradasDisponiblesAsync(idEstadio, sector.Codigo);
        }

        return estadio;
    }

    public async Task<List<Estadio>> GetAllAsync()
    {
        const string query = @"
            SELECT id_estadio, nombre, aforo, pais_dir, localidad, calle, numero_dir
            FROM Estadio
            ORDER BY nombre";

        var estadios = new List<Estadio>();

        using (var connection = (NpgsqlConnection)_connectionFactory.CreateConnection())
        {
            await connection.OpenAsync();

            using var command = new NpgsqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                estadios.Add(new Estadio
                {
                    IdEstadio = reader.GetInt32(0),
                    Nombre = reader.GetString(1),
                    Aforo = reader.GetInt32(2),
                    PaisDir = reader.GetString(3),
                    Localidad = reader.GetString(4),
                    Calle = reader.GetString(5),
                    NumeroDir = reader.GetString(6)
                });
            }
        }

        foreach (var estadio in estadios)
        {
            estadio.Sectores = await _sectorRepository.GetByEstadioIdAsync(estadio.IdEstadio);
            foreach (var sector in estadio.Sectores)
            {
                sector.EntradasDisponibles = await _sectorRepository.GetEntradasDisponiblesAsync(
                    estadio.IdEstadio, sector.Codigo);
            }
        }

        return estadios;
    }

    public async Task<bool> ExistsByIdAsync(int idEstadio)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Estadio WHERE id_estadio = @id)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", idEstadio);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task<int> CreateAsync(Estadio estadio)
    {
        const string query = @"
            INSERT INTO Estadio (nombre, aforo, pais_dir, localidad, calle, numero_dir)
            VALUES (@nombre, @aforo, @pais_dir, @localidad, @calle, @numero_dir)
            RETURNING id_estadio";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@nombre", estadio.Nombre);
        command.Parameters.AddWithValue("@aforo", estadio.Aforo);
        command.Parameters.AddWithValue("@pais_dir", estadio.PaisDir);
        command.Parameters.AddWithValue("@localidad", estadio.Localidad);
        command.Parameters.AddWithValue("@calle", estadio.Calle);
        command.Parameters.AddWithValue("@numero_dir", estadio.NumeroDir);

        var result = await command.ExecuteScalarAsync();
        var idEstadio = (int)(result ?? 0);

        // Crear sectores
        foreach (var sector in estadio.Sectores)
        {
            sector.IdEstadio = idEstadio;
            await _sectorRepository.CreateAsync(sector);
        }

        return idEstadio;
    }

    public async Task UpdateAsync(Estadio estadio)
    {
        const string query = @"
            UPDATE Estadio 
            SET nombre = @nombre, aforo = @aforo, pais_dir = @pais_dir, 
                localidad = @localidad, calle = @calle, numero_dir = @numero_dir
            WHERE id_estadio = @id";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", estadio.IdEstadio);
        command.Parameters.AddWithValue("@nombre", estadio.Nombre);
        command.Parameters.AddWithValue("@aforo", estadio.Aforo);
        command.Parameters.AddWithValue("@pais_dir", estadio.PaisDir);
        command.Parameters.AddWithValue("@localidad", estadio.Localidad);
        command.Parameters.AddWithValue("@calle", estadio.Calle);
        command.Parameters.AddWithValue("@numero_dir", estadio.NumeroDir);

        await command.ExecuteNonQueryAsync();
    }
}
