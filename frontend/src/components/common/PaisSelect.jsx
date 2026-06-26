import React from "react";

const PAISES_MUNDIAL = [
  "Alemania", "Arabia Saudita", "Argentina", "Argelia", "Australia", "Austria", 
  "Bélgica", "Bosnia y Herzegovina", "Brasil", "Cabo Verde", "Canadá", "Catar", 
  "Colombia", "Corea del Sur", "Costa de Marfil", "Croacia", "Curazao", "Ecuador", 
  "Egipto", "Escocia", "España", "Estados Unidos", "Francia", "Ghana", "Haití", 
  "Inglaterra", "Irak", "Irán", "Japón", "Jordania", "Marruecos", "México", 
  "Noruega", "Nueva Zelanda", "Países Bajos", "Panamá", "Paraguay", "Portugal", 
  "República Checa", "República Democrática del Congo", "Senegal", "Sudáfrica", 
  "Suecia", "Suiza", "Túnez", "Turquía", "Uruguay", "Uzbekistán"
].sort();

// Lista reducida de sedes
const ANFITRIONES = ["Canadá", "USA", "México"];

export default function PaisSelect({ name, value, onChange, soloAnfitriones = false, className, style }) {
  // Si la propiedad soloAnfitriones es true, usa la lista corta; si no, usa la completa
  const listaPaises = soloAnfitriones ? ANFITRIONES : PAISES_MUNDIAL;

  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required
      className={className}
      style={{
        ...style,
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        backgroundSize: "16px",
        paddingRight: "40px",
        cursor: "pointer"
      }}
    >
      <option value="" disabled style={{ backgroundColor: "#1f2022", color: "#8e9199" }}>
        Seleccionar país...
      </option>
      {listaPaises.map((pais) => (
        <option key={pais} value={pais} style={{ backgroundColor: "#1f2022", color: "#ffffff" }}>
          {pais}
        </option>
      ))}
    </select>
  );
}
