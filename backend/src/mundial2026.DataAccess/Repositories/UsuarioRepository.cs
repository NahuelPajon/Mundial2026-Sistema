using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly ConnectionFactory _connectionFactory;
    private readonly IPerfilRepository _perfilRepository;

    public UsuarioRepository(ConnectionFactory connectionFactory, IPerfilRepository perfilRepository)
    {
        _connectionFactory = connectionFactory;
        _perfilRepository = perfilRepository;
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        const string query = @"
            SELECT u.email_perfil, u.fecha_registro, u.estado_verificacion
            FROM Usuario u
            WHERE u.email_perfil = @email";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        var usuario = new Usuario
        {
            FechaRegistro = reader.GetDateTime(1),
            EstadoVerificacion = reader.GetString(2)
        };

        await reader.CloseAsync();

        // Obtener datos del perfil
        var perfil = await _perfilRepository.GetByEmailAsync(email);
        usuario.Email = perfil.Email;
        usuario.PaisDir = perfil.PaisDir;
        usuario.Localidad = perfil.Localidad;
        usuario.Calle = perfil.Calle;
        usuario.NumeroDir = perfil.NumeroDir;
        usuario.CodPostal = perfil.CodPostal;
        usuario.DocPais = perfil.DocPais;
        usuario.DocTipo = perfil.DocTipo;
        usuario.DocNumero = perfil.DocNumero;
        usuario.Telefonos = perfil.Telefonos;

        return usuario;
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        const string query = "SELECT EXISTS(SELECT 1 FROM Usuario WHERE email_perfil = @email)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        var result = await command.ExecuteScalarAsync();
        return (bool)(result ?? false);
    }

    public async Task CreateAsync(Usuario usuario)
    {
        // Primero crear el Perfil
        await _perfilRepository.CreateAsync(usuario);

        // Luego crear el Usuario
        const string query = @"
            INSERT INTO Usuario (email_perfil, fecha_registro, estado_verificacion)
            VALUES (@email, @fecha_registro, @estado_verificacion)";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", usuario.Email);
        command.Parameters.AddWithValue("@fecha_registro", usuario.FechaRegistro);
        command.Parameters.AddWithValue("@estado_verificacion", usuario.EstadoVerificacion);

        await command.ExecuteNonQueryAsync();
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        // Actualizar Perfil
        await _perfilRepository.UpdateAsync(usuario);

        // Actualizar Usuario
        const string query = @"
            UPDATE Usuario 
            SET estado_verificacion = @estado_verificacion
            WHERE email_perfil = @email";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", usuario.Email);
        command.Parameters.AddWithValue("@estado_verificacion", usuario.EstadoVerificacion);

        await command.ExecuteNonQueryAsync();
    }
}
