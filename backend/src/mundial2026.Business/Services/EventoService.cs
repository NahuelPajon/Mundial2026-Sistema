using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class EventoService : IEventoService
{
    private static readonly HashSet<string> EstadosValidos =
        new(StringComparer.OrdinalIgnoreCase) { "programado", "en_curso", "finalizado", "cancelado" };

    private readonly IEventoRepository _eventoRepository;
    private readonly IEstadioRepository _estadioRepository;
    private readonly IEquipoRepository _equipoRepository;
    private readonly IAdminRepository _adminRepository;

    public EventoService(
        IEventoRepository eventoRepository,
        IEstadioRepository estadioRepository,
        IEquipoRepository equipoRepository,
        IAdminRepository adminRepository)
    {
        _eventoRepository = eventoRepository;
        _estadioRepository = estadioRepository;
        _equipoRepository = equipoRepository;
        _adminRepository = adminRepository;
    }

    public async Task<Evento> GetByIdAsync(int idEvento)
    {
        if (idEvento <= 0)
            throw new ArgumentException("ID de evento debe ser mayor a 0");

        var evento = await _eventoRepository.GetByIdAsync(idEvento);
        if (evento == null)
            throw new KeyNotFoundException($"Evento con ID {idEvento} no encontrado");

        return evento;
    }

    public async Task<List<Evento>> GetAllAsync(int? idEstadio = null)
    {
        if (idEstadio is <= 0)
            throw new ArgumentException("ID de estadio inválido");

        return await _eventoRepository.GetAllAsync(idEstadio);
    }

    public async Task<int> CreateAsync(string emailAdmin, CreateEventoDto dto)
    {
        if (string.IsNullOrWhiteSpace(emailAdmin))
            throw new ArgumentException("Email de administrador no puede estar vacío");

        if (dto.IdEquipoLocal == dto.IdEquipoVisitante)
            throw new ArgumentException("El equipo local y visitante no pueden ser el mismo");

        if (dto.SectoresHabilitados == null || dto.SectoresHabilitados.Count == 0)
            throw new ArgumentException("Debe habilitar al menos un sector");

        if (!EstadosValidos.Contains(dto.Estado))
            throw new ArgumentException($"Estado inválido. Valores permitidos: {string.Join(", ", EstadosValidos)}");

        var admin = await _adminRepository.GetByEmailAsync(emailAdmin);
        if (admin == null)
            throw new UnauthorizedAccessException("Solo un administrador puede crear eventos");

        var estadio = await _estadioRepository.GetByIdAsync(dto.IdEstadio);
        if (estadio == null)
            throw new KeyNotFoundException($"Estadio con ID {dto.IdEstadio} no encontrado");

        if (!admin.PaisDir.Equals(estadio.PaisDir, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException(
                $"El administrador no tiene jurisdicción sobre estadios en {estadio.PaisDir}");

        if (!await _equipoRepository.ExistsByIdAsync(dto.IdEquipoLocal))
            throw new KeyNotFoundException($"Equipo local con ID {dto.IdEquipoLocal} no encontrado");

        if (!await _equipoRepository.ExistsByIdAsync(dto.IdEquipoVisitante))
            throw new KeyNotFoundException($"Equipo visitante con ID {dto.IdEquipoVisitante} no encontrado");

        var sectores = dto.SectoresHabilitados
            .Select(s => s.Trim().ToUpperInvariant())
            .Distinct()
            .ToList();

        if (!await _eventoRepository.AllSectoresExistInEstadioAsync(dto.IdEstadio, sectores))
            throw new ArgumentException("Uno o más sectores no existen en el estadio indicado");

        if (await _eventoRepository.HasOverlappingEventAsync(dto.IdEstadio, dto.Fecha))
            throw new InvalidOperationException(
                "Ya existe un evento programado en ese estadio con horario superpuesto (ventana de 3 horas)");

        var evento = new Evento
        {
            Fecha = dto.Fecha,
            Estado = dto.Estado.ToLowerInvariant(),
            IdEstadio = dto.IdEstadio,
            EmailAdmin = emailAdmin,
            IdEquipoLocal = dto.IdEquipoLocal,
            IdEquipoVisitante = dto.IdEquipoVisitante
        };

        return await _eventoRepository.CreateAsync(evento, sectores);
    }
}
