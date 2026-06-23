using mundial2026.DataAccess.Models;
using Npgsql;

namespace mundial2026.DataAccess.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public AuthRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> ValidateCredentialsAsync(string email, string password)
    {
        const string query = @"
            SELECT password_hash = crypt(@password, password_hash)
            FROM Perfil
            WHERE email = @email";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);
        command.Parameters.AddWithValue("@password", password);

        var result = await command.ExecuteScalarAsync();
        return result is bool valid && valid;
    }

    public async Task<string?> GetRolAsync(string email)
    {
        const string query = @"
            SELECT CASE
                WHEN EXISTS (SELECT 1 FROM Admin WHERE email_perfil = @email) THEN 'Admin'
                WHEN EXISTS (SELECT 1 FROM Funcionario WHERE email_perfil = @email) THEN 'Funcionario'
                WHEN EXISTS (SELECT 1 FROM Usuario WHERE email_perfil = @email) THEN 'Usuario'
            END";

        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var command = new NpgsqlCommand(query, connection);
        command.Parameters.AddWithValue("@email", email);

        var result = await command.ExecuteScalarAsync();
        return result as string;
    }

    public async Task RegisterUsuarioAsync(Perfil perfil, DateTime fechaRegistro, string estadoVerificacion)
    {
        await RegisterPerfilAsync(perfil, async (connection, transaction) =>
        {
            const string query = @"
                INSERT INTO Usuario (email_perfil, fecha_registro, estado_verificacion)
                VALUES (@email, @fecha_registro, @estado_verificacion)";

            using var command = new NpgsqlCommand(query, connection, transaction);
            command.Parameters.AddWithValue("@email", perfil.Email);
            command.Parameters.AddWithValue("@fecha_registro", fechaRegistro.Date);
            command.Parameters.AddWithValue("@estado_verificacion", estadoVerificacion);
            await command.ExecuteNonQueryAsync();
        });
    }

    public async Task RegisterAdminAsync(Perfil perfil, DateTime fechaAsignacion)
    {
        await RegisterPerfilAsync(perfil, async (connection, transaction) =>
        {
            const string query = @"
                INSERT INTO Admin (email_perfil, fecha_asignacion)
                VALUES (@email, @fecha_asignacion)";

            using var command = new NpgsqlCommand(query, connection, transaction);
            command.Parameters.AddWithValue("@email", perfil.Email);
            command.Parameters.AddWithValue("@fecha_asignacion", fechaAsignacion.Date);
            await command.ExecuteNonQueryAsync();
        });
    }

    public async Task RegisterFuncionarioAsync(Perfil perfil, string nroLegajo)
    {
        await RegisterPerfilAsync(perfil, async (connection, transaction) =>
        {
            const string query = @"
                INSERT INTO Funcionario (email_perfil, nro_legajo)
                VALUES (@email, @nro_legajo)";

            using var command = new NpgsqlCommand(query, connection, transaction);
            command.Parameters.AddWithValue("@email", perfil.Email);
            command.Parameters.AddWithValue("@nro_legajo", nroLegajo);
            await command.ExecuteNonQueryAsync();
        });
    }

    private async Task RegisterPerfilAsync(Perfil perfil, Func<NpgsqlConnection, NpgsqlTransaction, Task> insertSubclass)
    {
        using var connection = (NpgsqlConnection)_connectionFactory.CreateConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            const string perfilQuery = @"
                INSERT INTO Perfil (email, pais_dir, localidad, calle, numero_dir, cod_postal,
                                    doc_pais, doc_tipo, doc_numero, password_hash)
                VALUES (@email, @pais_dir, @localidad, @calle, @numero_dir, @cod_postal,
                        @doc_pais, @doc_tipo, @doc_numero, crypt(@password, gen_salt('bf')))";

            using (var command = new NpgsqlCommand(perfilQuery, connection, transaction))
            {
                command.Parameters.AddWithValue("@email", perfil.Email);
                command.Parameters.AddWithValue("@pais_dir", perfil.PaisDir);
                command.Parameters.AddWithValue("@localidad", perfil.Localidad);
                command.Parameters.AddWithValue("@calle", perfil.Calle);
                command.Parameters.AddWithValue("@numero_dir", perfil.NumeroDir);
                command.Parameters.AddWithValue("@cod_postal", perfil.CodPostal);
                command.Parameters.AddWithValue("@doc_pais", perfil.DocPais);
                command.Parameters.AddWithValue("@doc_tipo", perfil.DocTipo);
                command.Parameters.AddWithValue("@doc_numero", perfil.DocNumero);
                command.Parameters.AddWithValue("@password", perfil.PasswordHash);
                await command.ExecuteNonQueryAsync();
            }

            foreach (var telefono in perfil.Telefonos)
            {
                const string telefonoQuery = @"
                    INSERT INTO Telefono (email_perfil, telefono)
                    VALUES (@email, @telefono)";

                using var command = new NpgsqlCommand(telefonoQuery, connection, transaction);
                command.Parameters.AddWithValue("@email", perfil.Email);
                command.Parameters.AddWithValue("@telefono", telefono);
                await command.ExecuteNonQueryAsync();
            }

            await insertSubclass(connection, transaction);
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
