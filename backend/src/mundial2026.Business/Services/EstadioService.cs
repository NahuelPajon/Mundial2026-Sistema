using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class EstadioService : IEstadioService
{
    private readonly IEstadioRepository _estadioRepository;
    private readonly ISectorRepository _sectorRepository;
    private readonly IAdminRepository _adminRepository;

    public EstadioService(
        IEstadioRepository estadioRepository,
        ISectorRepository sectorRepository,
        IAdminRepository adminRepository)
    {
        _estadioRepository = estadioRepository;
        _sectorRepository = sectorRepository;
        _adminRepository = adminRepository;
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

    public async Task<List<Sector>> GetSectoresAsync(int idEstadio)
    {
        if (idEstadio <= 0)
            throw new ArgumentException("ID de estadio debe ser mayor a 0");

        if (!await _estadioRepository.ExistsByIdAsync(idEstadio))
            throw new KeyNotFoundException($"Estadio con ID {idEstadio} no encontrado");

        return await _sectorRepository.GetByEstadioIdAsync(idEstadio);
    }

    public async Task<int> CreateAsync(string emailAdmin, string nombre, int aforo, string paisDir,
                                       string localidad, string calle, string numeroDir,
                                       List<SectorCreationDto> sectores)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("Nombre del estadio no puede estar vacío");

        if (aforo <= 0)
            throw new ArgumentException("Aforo debe ser mayor a 0");

        if (sectores == null || sectores.Count == 0)
            throw new ArgumentException("Debe haber al menos un sector");

        // Validar jurisdicción del admin
        var admin = await _adminRepository.GetByEmailAsync(emailAdmin);
        if (admin == null)
            throw new UnauthorizedAccessException("Solo un administrador puede crear estadios");

        if (!admin.PaisDir.Equals(paisDir, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException(
                $"No tenés jurisdicción para crear estadios en {paisDir}. Tu país asignado es {admin.PaisDir}");

        var totalCapacidad = sectores.Sum(s => s.CapacidadMaxima);
        if (totalCapacidad > aforo)
            throw new InvalidOperationException(
                $"Capacidad total de sectores ({totalCapacidad}) no puede exceder aforo ({aforo})");

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

    public async Task UpdateSectorPrecioAsync(string emailAdmin, int idEstadio, string codigoSector, decimal nuevoPrecio)
    {
        if (nuevoPrecio < 0)
            throw new ArgumentException("El precio no puede ser negativo");

        // Validar que el admin existe
        var admin = await _adminRepository.GetByEmailAsync(emailAdmin);
        if (admin == null)
            throw new UnauthorizedAccessException("Solo un administrador puede modificar precios");

        // Validar que el estadio existe
        var estadio = await _estadioRepository.GetByIdAsync(idEstadio);
        if (estadio == null)
            throw new KeyNotFoundException($"Estadio con ID {idEstadio} no encontrado");

        // Validar jurisdicción
        if (!admin.PaisDir.Equals(estadio.PaisDir, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException(
                $"No tenés jurisdicción sobre estadios en {estadio.PaisDir}. Tu país asignado es {admin.PaisDir}");

        // Validar que el sector existe
        var sector = await _sectorRepository.GetBySectorAsync(idEstadio, codigoSector);
        if (sector == null)
            throw new KeyNotFoundException($"Sector '{codigoSector}' no encontrado en el estadio {idEstadio}");

        sector.Costo = nuevoPrecio;
        await _sectorRepository.UpdateAsync(sector);
    }
}

public class SectorCreationDto
{
    public string Codigo { get; set; } = string.Empty;
    public int CapacidadMaxima { get; set; }
    public decimal Costo { get; set; }
}