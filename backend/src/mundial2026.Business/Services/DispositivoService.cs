using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class DispositivoService : IDispositivoService
{
    private readonly IDispositivoRepository _dispositivoRepository;
    private readonly IFuncionarioRepository _funcionarioRepository;

    public DispositivoService(
        IDispositivoRepository dispositivoRepository,
        IFuncionarioRepository funcionarioRepository)
    {
        _dispositivoRepository = dispositivoRepository;
        _funcionarioRepository = funcionarioRepository;
    }

    public Task<List<Dispositivo>> GetAllAsync() =>
        _dispositivoRepository.GetAllAsync();

    public async Task<List<Dispositivo>> GetMisDispositivosAsync(string emailFuncionario)
    {
        if (string.IsNullOrWhiteSpace(emailFuncionario))
            throw new ArgumentException("Email de funcionario no puede estar vacío");

        if (!await _funcionarioRepository.ExistsByEmailAsync(emailFuncionario))
            throw new KeyNotFoundException($"Funcionario {emailFuncionario} no encontrado");

        return await _dispositivoRepository.GetByFuncionarioAsync(emailFuncionario);
    }

    public async Task<Dispositivo> CreateAsync(string descripcion, string emailFuncionario)
    {
        if (string.IsNullOrWhiteSpace(descripcion))
            throw new ArgumentException("La descripción del dispositivo no puede estar vacía");

        if (string.IsNullOrWhiteSpace(emailFuncionario))
            throw new ArgumentException("Email de funcionario no puede estar vacío");

        if (!await _funcionarioRepository.ExistsByEmailAsync(emailFuncionario))
            throw new KeyNotFoundException($"Funcionario {emailFuncionario} no encontrado");

        var id = await _dispositivoRepository.CreateAsync(descripcion.Trim(), emailFuncionario);
        return (await _dispositivoRepository.GetByIdAsync(id))!;
    }

    public async Task<bool> DeleteAsync(int idDispositivo)
    {
        if (idDispositivo <= 0)
            throw new ArgumentException("ID de dispositivo inválido");

        var eliminado = await _dispositivoRepository.DeleteAsync(idDispositivo);
        if (!eliminado)
            throw new KeyNotFoundException($"Dispositivo {idDispositivo} no encontrado");

        return true;
    }
}
