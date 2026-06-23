-- ============================================================
-- CONSULTAS CLAVE - SISTEMA DE TICKETING MUNDIAL 2026
-- ============================================================


-- ------------------------------------------------------------
-- 1. RANKING DE MAYORES COMPRADORES
-- Usuarios con más entradas adquiridas (no transferidas, sino compradas)
-- ------------------------------------------------------------
SELECT
    u.email_perfil,
    p.email,
    COUNT(e.id_entrada) AS cantidad_entradas_compradas,
    SUM(v.monto_total) AS monto_total_gastado
FROM Usuario u
JOIN Perfil p ON p.email = u.email_perfil
JOIN Venta v ON v.email_usuario = u.email_perfil
JOIN Entrada e ON e.id_venta = v.id_venta
GROUP BY u.email_perfil, p.email
ORDER BY cantidad_entradas_compradas DESC
LIMIT 10;

select * from perfil p
select * from usuario u
select * from admin a
select * from funcionario f
select * from equipo e
select * from entrada e
select * from estadio e
select * from sector s

-- ------------------------------------------------------------
-- 2. EVENTOS CON MÁS ENTRADAS VENDIDAS
-- ------------------------------------------------------------
SELECT
    ev.id_evento,
    el.nombre AS equipo_local,
    ev2.nombre AS equipo_visitante,
    ev.fecha,
    est.nombre AS estadio,
    COUNT(e.id_entrada) AS entradas_vendidas
FROM Evento ev
JOIN Equipo el  ON el.id_equipo  = ev.id_equipo_local
JOIN Equipo ev2 ON ev2.id_equipo = ev.id_equipo_visitante
JOIN Estadio est ON est.id_estadio = ev.id_estadio
LEFT JOIN Entrada e ON e.id_evento = ev.id_evento
GROUP BY ev.id_evento, el.nombre, ev2.nombre, ev.fecha, est.nombre
ORDER BY entradas_vendidas DESC;


-- ------------------------------------------------------------
-- 3. ENTRADAS ACTUALES DE UN USUARIO (las que tiene asignadas hoy)
-- Reemplazar el email por el que se quiera consultar
-- ------------------------------------------------------------
SELECT
    e.id_entrada,
    ev.id_evento,
    el.nombre AS equipo_local,
    ev2.nombre AS equipo_visitante,
    ev.fecha,
    est.nombre AS estadio,
    e.codigo_sector,
    s.costo,
    e.consumida
FROM Entrada e
JOIN Evento ev   ON ev.id_evento = e.id_evento
JOIN Equipo el   ON el.id_equipo  = ev.id_equipo_local
JOIN Equipo ev2  ON ev2.id_equipo = ev.id_equipo_visitante
JOIN Estadio est ON est.id_estadio = ev.id_estadio
JOIN Sector s    ON s.id_estadio = e.id_estadio AND s.codigo = e.codigo_sector
WHERE e.titular = 'juan.perez@gmail.com'
ORDER BY ev.fecha;


-- ------------------------------------------------------------
-- 4. COMPRAS REALIZADAS POR UN USUARIO
-- Reemplazar el email por el que se quiera consultar
-- ------------------------------------------------------------
SELECT
    v.id_venta,
    v.fecha,
    v.estado,
    v.cantidad_comprada,
    v.monto_total,
    tc.porcentaje AS comision_aplicada
FROM Venta v
JOIN Tasa_Comision tc ON tc.id_tasa = v.id_tasa
WHERE v.email_usuario = 'juan.perez@gmail.com'
ORDER BY v.fecha DESC;


-- ------------------------------------------------------------
-- 5. TRANSFERENCIAS REALIZADAS POR UN USUARIO (enviadas y recibidas)
-- Reemplazar el email por el que se quiera consultar
-- ------------------------------------------------------------
SELECT
    t.id_transferencia,
    t.id_entrada,
    t.email_origen,
    t.email_destino,
    t.fecha_solicitud,
    t.fecha_aceptacion,
    t.estado,
    CASE
        WHEN t.email_origen = 'juan.perez@gmail.com' THEN 'enviada'
        ELSE 'recibida'
    END AS tipo
FROM Transferencia t
WHERE t.email_origen = 'juan.perez@gmail.com'
   OR t.email_destino = 'juan.perez@gmail.com'
ORDER BY t.fecha_solicitud DESC;


-- ------------------------------------------------------------
-- 6. HISTORIAL COMPLETO DE CUSTODIA DE UNA ENTRADA
-- Reconstruye el camino desde la emisión hasta la validación
-- Reemplazar el id_entrada por el que se quiera trazar
-- ------------------------------------------------------------
SELECT
    h.orden,
    t.email_origen,
    t.email_destino,
    t.fecha_solicitud,
    t.fecha_aceptacion,
    t.estado
FROM Historial_Transferencia h
JOIN Transferencia t ON t.id_transferencia = h.id_transferencia
WHERE h.id_entrada = 3
ORDER BY h.orden;


-- ------------------------------------------------------------
-- 7. OCUPACIÓN POR SECTOR EN UN EVENTO
-- Cuántas entradas se vendieron vs la capacidad máxima de cada sector
-- Reemplazar el id_evento por el que se quiera consultar
-- ------------------------------------------------------------
SELECT
    s.codigo AS sector,
    s.capacidad_maxima,
    COUNT(e.id_entrada) AS entradas_vendidas,
    s.capacidad_maxima - COUNT(e.id_entrada) AS lugares_disponibles,
    ROUND(100.0 * COUNT(e.id_entrada) / s.capacidad_maxima, 2) AS porcentaje_ocupacion
FROM Evento_Sector es
JOIN Sector s ON s.id_estadio = es.id_estadio AND s.codigo = es.codigo_sector
LEFT JOIN Entrada e ON e.id_evento = es.id_evento
                    AND e.id_estadio = es.id_estadio
                    AND e.codigo_sector = es.codigo_sector
WHERE es.id_evento = 1
GROUP BY s.codigo, s.capacidad_maxima
ORDER BY s.codigo;


-- ------------------------------------------------------------
-- 8. RECAUDACIÓN TOTAL POR EVENTO
-- ------------------------------------------------------------
SELECT
    ev.id_evento,
    el.nombre AS equipo_local,
    ev2.nombre AS equipo_visitante,
    ev.fecha,
    COALESCE(SUM(s.costo), 0) AS recaudacion_bruta
FROM Evento ev
JOIN Equipo el  ON el.id_equipo  = ev.id_equipo_local
JOIN Equipo ev2 ON ev2.id_equipo = ev.id_equipo_visitante
LEFT JOIN Entrada e ON e.id_evento = ev.id_evento
LEFT JOIN Sector s  ON s.id_estadio = e.id_estadio AND s.codigo = e.codigo_sector
GROUP BY ev.id_evento, el.nombre, ev2.nombre, ev.fecha
ORDER BY recaudacion_bruta DESC;


-- ------------------------------------------------------------
-- 9. FUNCIONARIOS QUE VALIDARON ENTRADAS EN TODOS LOS SECTORES
-- A LOS QUE FUERON ASIGNADOS DURANTE UN EVENTO
-- Regla de negocio explícita de la letra (punto 2 - Validación)
-- ------------------------------------------------------------

-- 9a. Sectores en los que cada funcionario realizó al menos una validación, por evento
SELECT DISTINCT
    val.email_funcionario,
    e.id_evento,
    e.codigo_sector
FROM Validacion val
JOIN Entrada e ON e.id_entrada = val.id_entrada
ORDER BY val.email_funcionario, e.id_evento, e.codigo_sector;

-- 9b. Funcionarios asignados (vía Dispositivo) que SÍ cubrieron todos los
-- sectores en los que validaron entradas dentro de un evento puntual
-- Reemplazar el id_evento según corresponda
SELECT
    val.email_funcionario,
    COUNT(DISTINCT e.codigo_sector) AS sectores_validados
FROM Validacion val
JOIN Entrada e ON e.id_entrada = val.id_entrada
WHERE e.id_evento = 1
GROUP BY val.email_funcionario;


-- ------------------------------------------------------------
-- 10. DISPOSITIVOS Y SU FUNCIONARIO ASOCIADO, CON CANTIDAD DE VALIDACIONES
-- ------------------------------------------------------------
SELECT
    d.id_dispositivo,
    d.descripcion,
    d.email_funcionario,
    COUNT(val.id_validacion) AS total_validaciones
FROM Dispositivo d
LEFT JOIN Validacion val ON val.id_dispositivo = d.id_dispositivo
GROUP BY d.id_dispositivo, d.descripcion, d.email_funcionario
ORDER BY total_validaciones DESC;


-- ------------------------------------------------------------
-- 11. QR ACTIVOS VIGENTES (para limpieza o monitoreo en tiempo real)
-- ------------------------------------------------------------
SELECT
    q.token,
    q.id_entrada,
    q.generado_en,
    q.expira_en,
    e.titular
FROM QR q
JOIN Entrada e ON e.id_entrada = q.id_entrada
WHERE q.activo = TRUE
  AND q.expira_en > NOW();


-- ------------------------------------------------------------
-- 12. ENTRADAS QUE YA ALCANZARON EL MÁXIMO DE 3 TRANSFERENCIAS
-- Útil para validar la regla de negocio antes de permitir una nueva
-- ------------------------------------------------------------
SELECT
    id_entrada,
    COUNT(*) AS cantidad_transferencias
FROM Historial_Transferencia
GROUP BY id_entrada
HAVING COUNT(*) >= 3;