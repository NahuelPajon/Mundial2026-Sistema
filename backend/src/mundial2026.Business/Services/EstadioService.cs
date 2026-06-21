using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class EstadioService : IEstadioService
{
    private readonly IEstadioRepository _estadioRepository;

    public EstadioService(IEstadioRepository estadioRepository)
    {
        _estadioRepository = estadioRepository;
    }

    public async Task<Estadio> GetByIdAsync(int idEstadio)
    {
        if (idEstadio <= 0)
            throw new ArgumentException("ID de estadio debe ser mayor a 0");

        var estadio = await _estadioRepository.GetByIdAsync(idEstadio);
        if (estadio == null)
            throw new KeyNotFoundException($"Estadio con ID {idEstadio} no encontrado");

        return estadio;
    }

    public async Task<List<Estadio>> GetAllAsync()
    {
        return await _estadioRepository.GetAllAsync();
    }

    public async Task<int> CreateAsync(string nombre, int aforo, string paisDir, string localidad,
                                       string calle, string numeroDir, List<SectorCreationDto> sectores)
    {
        // Validaciones
        if (string.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("Nombre del estadio no puede estar vacío");

        if (aforo <= 0)
            throw new ArgumentException("Aforo debe ser mayor a 0");

        if (sectores == null || sectores.Count == 0)
            throw new ArgumentException("Debe haber al menos un sector");

        var totalCapacidad = sectores.Sum(s => s.CapacidadMaxima);
        if (totalCapacidad > aforo)
            throw new InvalidOperationException($"Capacidad total de sectores ({totalCapacidad}) no puede exceder aforo ({aforo})");

        var estadio = new Estadio
        {
            Nombre = nombre,
            Aforo = aforo,
            PaisDir = paisDir,
            Localidad = localidad,
            Calle = calle,
            NumeroDir = numeroDir,
            Sectores = sectores.Select(s => new Sector
            {
                Codigo = s.Codigo,
                CapacidadMaxima = s.CapacidadMaxima,
                Costo = s.Costo
            }).ToList()
        };

        return await _estadioRepository.CreateAsync(estadio);
    }
}

public class SectorCreationDto
{
    public string Codigo { get; set; } = string.Empty;
    public int CapacidadMaxima { get; set; }
    public decimal Costo { get; set; }
}
