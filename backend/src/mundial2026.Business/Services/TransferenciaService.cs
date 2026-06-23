using mundial2026.DataAccess.Models;
using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class TransferenciaService : ITransferenciaService
{
    private const int MaxTransferenciasPorEntrada = 3;

    private readonly ITransferenciaRepository _transferenciaRepository;
    private readonly IEntradaRepository _entradaRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public TransferenciaService(
        ITransferenciaRepository transferenciaRepository,
        IEntradaRepository entradaRepository,
        IUsuarioRepository usuarioRepository)
    {
        _transferenciaRepository = transferenciaRepository;
        _entradaRepository = entradaRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<Transferencia> SolicitarAsync(string emailOrigen, int idEntrada, string emailDestino)
    {
        if (string.IsNullOrWhiteSpace(emailOrigen))
            throw new ArgumentException("Email de origen no puede estar vacío");

        if (string.IsNullOrWhiteSpace(emailDestino))
            throw new ArgumentException("Email de destino no puede estar vacío");

        if (emailOrigen.Equals(emailDestino, StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("No puede transferir una entrada a usted mismo");

        if (idEntrada <= 0)
            throw new ArgumentException("ID de entrada inválido");

        var entrada = await _entradaRepository.GetResumenByIdAsync(idEntrada)
            ?? throw new KeyNotFoundException($"Entrada con ID {idEntrada} no encontrada");

        if (!entrada.Titular.Equals(emailOrigen, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Solo el titular actual puede transferir la entrada");

        if (entrada.Consumida)
            throw new InvalidOperationException("No se puede transferir una entrada ya consumida");

        if (!await _usuarioRepository.ExistsByEmailAsync(emailDestino))
            throw new KeyNotFoundException($"Usuario destino {emailDestino} no encontrado");

        var transferenciasRealizadas = await _transferenciaRepository.CountHistorialByEntradaAsync(idEntrada);
        if (transferenciasRealizadas >= MaxTransferenciasPorEntrada)
            throw new InvalidOperationException(
                $"La entrada ya alcanzó el máximo de {MaxTransferenciasPorEntrada} transferencias");

        if (await _transferenciaRepository.HasPendingForEntradaAsync(idEntrada))
            throw new InvalidOperationException("Ya existe una transferencia pendiente para esta entrada");

        var idTransferencia = await _transferenciaRepository.CreateSolicitudAsync(
            idEntrada, emailOrigen, emailDestino);

        return (await _transferenciaRepository.GetByIdAsync(idTransferencia))!;
    }

    public async Task<Transferencia> AceptarAsync(string emailUsuario, int idTransferencia)
    {
        if (idTransferencia <= 0)
            throw new ArgumentException("ID de transferencia inválido");

        return await _transferenciaRepository.AceptarAsync(idTransferencia, emailUsuario);
    }

    public async Task<Transferencia> RechazarAsync(string emailUsuario, int idTransferencia)
    {
        if (idTransferencia <= 0)
            throw new ArgumentException("ID de transferencia inválido");

        return await _transferenciaRepository.RechazarAsync(idTransferencia, emailUsuario);
    }

    public async Task<Transferencia> GetByIdAsync(int idTransferencia, string emailUsuario)
    {
        if (idTransferencia <= 0)
            throw new ArgumentException("ID de transferencia inválido");

        var transferencia = await _transferenciaRepository.GetByIdAsync(idTransferencia)
            ?? throw new KeyNotFoundException($"Transferencia {idTransferencia} no encontrada");

        if (!EsParticipante(transferencia, emailUsuario))
            throw new UnauthorizedAccessException("No tiene permiso para ver esta transferencia");

        return transferencia;
    }

    public async Task<List<Transferencia>> GetByUsuarioAsync(string emailUsuario, string? tipo = null)
    {
        if (string.IsNullOrWhiteSpace(emailUsuario))
            throw new ArgumentException("Email no puede estar vacío");

        if (tipo != null && tipo is not ("enviadas" or "recibidas" or "todas"))
            throw new ArgumentException("Tipo inválido. Valores: enviadas, recibidas, todas");

        var filtro = tipo == "todas" ? null : tipo;
        return await _transferenciaRepository.GetByUsuarioAsync(emailUsuario, filtro);
    }

    private static bool EsParticipante(Transferencia transferencia, string email) =>
        transferencia.EmailOrigen.Equals(email, StringComparison.OrdinalIgnoreCase)
        || transferencia.EmailDestino.Equals(email, StringComparison.OrdinalIgnoreCase);
}
