using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using mundial2026.API.DTOs;
using mundial2026.API.Services;
using mundial2026.Business.Services;

namespace mundial2026.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IJwtTokenService jwtTokenService,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _jwtTokenService = jwtTokenService;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _authService.LoginAsync(request.Email, request.Password);
            var expiraEn = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

            return Ok(new AuthResponse
            {
                Token = _jwtTokenService.GenerateToken(user.Email, user.Rol),
                Email = user.Email,
                Rol = user.Rol,
                ExpiraEn = expiraEn
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error en login: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [HttpPost("registro")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            await _authService.RegisterAsync(new RegisterProfileDto
            {
                Rol = request.Rol,
                Email = request.Email,
                Password = request.Password,
                PaisDir = request.PaisDir,
                Localidad = request.Localidad,
                Calle = request.Calle,
                NumeroDir = request.NumeroDir,
                CodPostal = request.CodPostal,
                DocPais = request.DocPais,
                DocTipo = request.DocTipo,
                DocNumero = request.DocNumero,
                Telefonos = request.Telefonos,
                FechaAsignacion = request.FechaAsignacion,
                NroLegajo = request.NroLegajo
            });

            _logger.LogInformation($"Perfil {request.Email} registrado como {request.Rol}");
            return Ok(new { mensaje = "Registro exitoso", email = request.Email, rol = request.Rol });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error en registro: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        try
        {
            var email = User.FindFirstValue(ClaimTypes.Email)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(email))
                return Unauthorized(new { error = "Token inválido" });

            var user = await _authService.GetCurrentUserAsync(email);
            return Ok(new MeResponse { Email = user.Email, Rol = user.Rol });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error en me: {ex.Message}");
            return StatusCode(500, new { error = "Error interno del servidor" });
        }
    }
}
