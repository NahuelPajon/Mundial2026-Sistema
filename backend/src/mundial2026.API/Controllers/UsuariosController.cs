using mundial2026.Business.Services;
using mundial2026.API.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace mundial2026.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly IPerfilService _perfilService;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(IUsuarioService usuarioService, IPerfilService perfilService, 
                             ILogger<UsuariosController> logger)
    {
        _usuarioService = usuarioService;
        _perfilService = perfilService;
        _logger = logger;
    }

    /// <summary>
    /// Registra un nuevo usuario
    /// </summary>
    [HttpPost("registro")]
    public async Task<IActionResult> Registrar([FromBody] RegisterUserRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _usuarioService.RegisterAsync(
                request.Email,
                request.PaisDir,
                request.Localidad,
                request.Calle,
                request.NumeroDir,
                request.CodPostal,
                request.DocPais,
                request.DocTipo,
                request.DocNumero,
                request.Telefonos
            );

            _logger.LogInformation($"Usuario {request.Email} registrado exitosamente");
            return Ok(new { mensaje = "Usuario registrado exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Error al registrar usuario: {ex.Message}");
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error inesperado: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtiene el perfil de un usuario
    /// </summary>
    [HttpGet("{email}")]
    public async Task<IActionResult> GetPerfil(string email)
    {
        try
        {
            var usuario = await _usuarioService.GetByEmailAsync(email);
            var response = new UserProfileResponse
            {
                Email = usuario.Email,
                PaisDir = usuario.PaisDir,
                Localidad = usuario.Localidad,
                Calle = usuario.Calle,
                NumeroDir = usuario.NumeroDir,
                CodPostal = usuario.CodPostal,
                DocPais = usuario.DocPais,
                DocTipo = usuario.DocTipo,
                DocNumero = usuario.DocNumero,
                Telefonos = usuario.Telefonos,
                FechaRegistro = usuario.FechaRegistro,
                EstadoVerificacion = usuario.EstadoVerificacion
            };

            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning($"Usuario no encontrado: {ex.Message}");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error inesperado: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }
}
