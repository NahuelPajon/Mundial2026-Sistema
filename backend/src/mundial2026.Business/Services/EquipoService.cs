using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class EquipoService : IEquipoService
{
    private readonly IEquipoRepository _equipoRepository;

    public EquipoService(IEquipoRepository equipoRepository)
    {
        _equipoRepository = equipoRepository;
    }

    public async Task<Equipo> GetByIdAsync(int idEquipo)
    {
        if (idEquipo <= 0)
            throw new ArgumentException("ID de equipo debe ser mayor a 0");

        var equipo = await _equipoRepository.GetByIdAsync(idEquipo);
        if (equipo == null)
            throw new KeyNotFoundException($"Equipo con ID {idEquipo} no encontrado");

        return equipo;
    }

    public async Task<List<Equipo>> GetAllAsync()
    {
        return await _equipoRepository.GetAllAsync();
    }

    public async Task<int> CreateAsync(string nombre, string pais)
    {
        ValidateNombrePais(nombre, pais);

        if (await _equipoRepository.ExistsByNombreAsync(nombre))
            throw new InvalidOperationException($"Ya existe un equipo con nombre '{nombre}'");

        return await _equipoRepository.CreateAsync(new Equipo
        {
            Nombre = nombre.Trim(),
            Pais = pais.Trim()
        });
    }

    public async Task UpdateAsync(int idEquipo, string nombre, string pais)
    {
        if (idEquipo <= 0)
            throw new ArgumentException("ID de equipo debe ser mayor a 0");

        ValidateNombrePais(nombre, pais);

        if (!await _equipoRepository.ExistsByIdAsync(idEquipo))
            throw new KeyNotFoundException($"Equipo con ID {idEquipo} no encontrado");

        if (await _equipoRepository.ExistsByNombreAsync(nombre, idEquipo))
            throw new InvalidOperationException($"Ya existe otro equipo con nombre '{nombre}'");

        await _equipoRepository.UpdateAsync(new Equipo
        {
            IdEquipo = idEquipo,
            Nombre = nombre.Trim(),
            Pais = pais.Trim()
        });
    }

    public async Task DeleteAsync(int idEquipo)
    {
        if (idEquipo <= 0)
            throw new ArgumentException("ID de equipo debe ser mayor a 0");

        if (!await _equipoRepository.ExistsByIdAsync(idEquipo))
            throw new KeyNotFoundException($"Equipo con ID {idEquipo} no encontrado");

        if (await _equipoRepository.IsUsedInEventoAsync(idEquipo))
            throw new InvalidOperationException("No se puede eliminar un equipo asociado a eventos");

        await _equipoRepository.DeleteAsync(idEquipo);
    }

    private static void ValidateNombrePais(string nombre, string pais)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("Nombre del equipo no puede estar vacío");

        if (string.IsNullOrWhiteSpace(pais))
            throw new ArgumentException("País del equipo no puede estar vacío");
    }
}
