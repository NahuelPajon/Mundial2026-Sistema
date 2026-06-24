using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public interface IEntradaService
{
    Task<List<Entrada>> GetActivasByTitularAsync(string emailTitular);
}

public class EntradaService : IEntradaService
{
    private readonly IEntradaRepository _entradaRepository;

    public EntradaService(IEntradaRepository entradaRepository)
    {
        _entradaRepository = entradaRepository;
    }

    public async Task<List<Entrada>> GetActivasByTitularAsync(string emailTitular)
    {
        if (string.IsNullOrWhiteSpace(emailTitular))
            throw new ArgumentException("Email no puede estar vacío");

        return await _entradaRepository.GetActivasByTitularAsync(emailTitular);
    }
}
