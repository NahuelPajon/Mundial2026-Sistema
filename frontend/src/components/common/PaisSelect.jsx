import React from "react";

// Lista oficializada de los 48 clasificados
const PAISES_MUNDIAL = [
  "Alemania", "Arabia Saudita", "Argentina", "Argelia", "Australia", "Austria", 
  "Bélgica", "Bosnia y Herzegovina", "Brasil", "Cabo Verde", "Canadá", "Catar", 
  "Colombia", "Corea del Sur", "Costa de Marfil", "Croacia", "Curazao", "Ecuador", 
  "Egipto", "Escocia", "España", "Estados Unidos", "Francia", "Ghana", "Haití", 
  "Inglaterra", "Irak", "Irán", "Japón", "Jordania", "Marruecos", "México", 
  "Noruega", "Nueva Zelanda", "Países Bajos", "Panamá", "Paraguay", "Portugal", 
  "República Checa", "República Democrática del Congo", "Senegal", "Sudáfrica", 
  "Suecia", "Suiza", "Túnez", "Turquía", "Uruguay", "Uzbekistán"
].sort(); // Los ordena alfabéticamente de forma automática

export default function PaisSelect({ name, value, onChange, onFocus, onBlur, style }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      required
      className="w-full px-4 py-3 text-base rounded transition"
      style={{
        ...style,
        appearance: "none", // Quita el estilo por defecto de select de Windows/Mac
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23c4c6cf' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
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
      {PAISES_MUNDIAL.map((pais) => (
        <option key={pais} value={pais} style={{ backgroundColor: "#1f2022", color: "#e3e2e5" }}>
          {pais}
        </option>
      ))}
    </select>
  );
}
