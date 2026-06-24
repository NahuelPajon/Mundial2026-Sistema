using mundial2026.DataAccess.Repositories;

namespace mundial2026.Business.Services;

public class QrService : IQrService
{
    private readonly IQrRepository _qrRepository;
    private readonly IEntradaRepository _entradaRepository;

    public QrService(IQrRepository qrRepository, IEntradaRepository entradaRepository)
    {
        _qrRepository = qrRepository;
        _entradaRepository = entradaRepository;
    }

    public async Task<QrActivoDto> ObtenerQrActivoAsync(string emailTitular, int idEntrada)
    {
        if (string.IsNullOrWhiteSpace(emailTitular))
            throw new ArgumentException("Email no puede estar vacío");

        if (idEntrada <= 0)
            throw new ArgumentException("ID de entrada inválido");

        var entrada = await _entradaRepository.GetResumenByIdAsync(idEntrada)
            ?? throw new KeyNotFoundException($"Entrada con ID {idEntrada} no encontrada");

        if (!entrada.Titular.Equals(emailTitular, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Solo el titular puede generar el QR de esta entrada");

        if (entrada.Consumida)
            throw new InvalidOperationException("La entrada ya fue consumida");

        var qrVigente = await _qrRepository.GetActivoVigenteByEntradaAsync(idEntrada);
        var qr = qrVigente ?? await _qrRepository.RotarTokenAsync(idEntrada);

        var segundosRestantes = (int)Math.Max(0, (qr.ExpiraEn - DateTime.UtcNow).TotalSeconds);

        return new QrActivoDto
        {
            Token = qr.Token,
            IdEntrada = qr.IdEntrada,
            GeneradoEn = qr.GeneradoEn,
            ExpiraEn = qr.ExpiraEn,
            ExpiresIn = segundosRestantes > 0 ? segundosRestantes : 30
        };
    }
}
