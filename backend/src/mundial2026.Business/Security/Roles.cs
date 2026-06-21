namespace mundial2026.Business.Security;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Funcionario = "Funcionario";
    public const string Usuario = "Usuario";

    public static readonly string[] All = [Admin, Funcionario, Usuario];

    public static bool IsValid(string? rol) =>
        !string.IsNullOrWhiteSpace(rol) && All.Contains(rol, StringComparer.OrdinalIgnoreCase);

    public static string Normalize(string rol) =>
        All.First(r => r.Equals(rol, StringComparison.OrdinalIgnoreCase));
}
