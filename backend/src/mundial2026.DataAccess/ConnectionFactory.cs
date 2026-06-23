using System.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace mundial2026.DataAccess;

public class ConnectionFactory
{
    private readonly IConfiguration _configuration;

    public ConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public IDbConnection CreateConnection()
    {
        // Lee la cadena de conexión desde el archivo appsettings.json
        string connectionString = _configuration.GetConnectionString("PostgresConnection") 
            ?? throw new InvalidOperationException("Cadena de conexión no encontrada.");
            
        return new NpgsqlConnection(connectionString);
    }
}
