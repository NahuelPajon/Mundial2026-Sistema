-- ============================================================
-- SIMULACIÓN: 100 compras usando los usuarios del seed
-- Ejecutar manualmente, NO es parte del seed de arranque
--
-- ▼ EDITÁ ESTO: IDs de los eventos a los que se comprarán entradas
-- ============================================================

DO $$
DECLARE
    v_eventos_ids       INT[]   := ARRAY[1,2,3];  -- ← cambiar según los eventos que existan en la base de datos

    -- usuarios del seed (solo Usuarios, no Admins ni Funcionarios)
    v_usuarios          VARCHAR[] := ARRAY[
        'juan.perez@gmail.com',
        'maria.garcia@gmail.com',
        'carlos.lopez@gmail.com',
        'ana.martinez@gmail.com',
        'pedro.silva@gmail.com',
        'lucia.fernandez@gmail.com'
    ];

    v_total_compras     INT     := 1000;

    -- variables internas
    v_n                 INT;
    v_email             VARCHAR;
    v_id_venta          INT;
    v_id_tasa           INT;
    v_cantidad          INT;
    v_monto_acumulado   DECIMAL;
    v_monto_final       DECIMAL;
    v_i                 INT;
    v_count_opciones    INT;
    v_offset            INT;
    v_id_evento         INT;
    v_id_estadio        INT;
    v_codigo_sector     VARCHAR;
    v_costo_sector      DECIMAL;
BEGIN
    -- Tasa vigente
    SELECT id_tasa INTO v_id_tasa
    FROM Tasa_Comision
    WHERE fecha_desde <= CURRENT_DATE
      AND (fecha_hasta IS NULL OR fecha_hasta >= CURRENT_DATE)
    ORDER BY fecha_desde DESC LIMIT 1;

    IF v_id_tasa IS NULL THEN
        RAISE EXCEPTION 'No hay tasa de comisión vigente.';
    END IF;

    -- Validar que los eventos tienen sectores habilitados
    SELECT COUNT(*) INTO v_count_opciones
    FROM Evento_Sector WHERE id_evento = ANY(v_eventos_ids);

    IF v_count_opciones = 0 THEN
        RAISE EXCEPTION 'Los eventos indicados no tienen sectores habilitados.';
    END IF;

    RAISE NOTICE 'Iniciando simulación: % compras sobre % combinaciones evento/sector disponibles.',
        v_total_compras, v_count_opciones;

    FOR v_n IN 1..v_total_compras LOOP

        -- Rotar entre los usuarios del seed
        v_email := v_usuarios[((v_n - 1) % array_length(v_usuarios, 1)) + 1];

        -- Cantidad de entradas: entre 1 y 5
        v_cantidad := (v_n % 5) + 1;
        v_monto_acumulado := 0;

        -- Crear la venta
        INSERT INTO Venta (fecha, estado, monto_total, cantidad_comprada, email_usuario, id_tasa)
        VALUES (
            NOW() - ((v_n % 60) * INTERVAL '1 hour'),
            'paga',
            0,
            v_cantidad,
            v_email,
            v_id_tasa
        )
        RETURNING id_venta INTO v_id_venta;

        -- Crear cada entrada de la venta
        FOR v_i IN 1..v_cantidad LOOP

            -- Elegir evento/sector al azar de los habilitados
            v_offset := floor(random() * v_count_opciones)::INT;

            SELECT es.id_evento, es.id_estadio, es.codigo_sector, s.costo
            INTO v_id_evento, v_id_estadio, v_codigo_sector, v_costo_sector
            FROM Evento_Sector es
            JOIN Sector s ON s.id_estadio = es.id_estadio AND s.codigo = es.codigo_sector
            WHERE es.id_evento = ANY(v_eventos_ids)
            LIMIT 1 OFFSET v_offset;

            INSERT INTO Entrada (titular, id_venta, id_evento, id_estadio, codigo_sector, consumida)
            VALUES (v_email, v_id_venta, v_id_evento, v_id_estadio, v_codigo_sector, FALSE);

            v_monto_acumulado := v_monto_acumulado + v_costo_sector;

        END LOOP;

        -- Actualizar monto con comisión
        SELECT ROUND(v_monto_acumulado * (1 + tc.porcentaje / 100), 2)
        INTO v_monto_final
        FROM Tasa_Comision tc WHERE id_tasa = v_id_tasa;

        UPDATE Venta SET monto_total = v_monto_final WHERE id_venta = v_id_venta;

    END LOOP;

    RAISE NOTICE 'Simulación completada: % compras generadas.', v_total_compras;
END $$;

-- ------------------------------------------------------------
-- VERIFICACIÓN
-- ------------------------------------------------------------
SELECT 'Compras simuladas' AS concepto, COUNT(*) AS total
FROM Venta WHERE email_usuario IN (
    'juan.perez@gmail.com','maria.garcia@gmail.com','carlos.lopez@gmail.com',
    'ana.martinez@gmail.com','pedro.silva@gmail.com','lucia.fernandez@gmail.com'
)
AND id_venta > 6   -- excluye las ventas del seed original

UNION ALL

SELECT 'Entradas simuladas', COUNT(*)
FROM Entrada e JOIN Venta v ON v.id_venta = e.id_venta
WHERE v.id_venta > 6

UNION ALL

SELECT 'Compras de ' || v.email_usuario, COUNT(*)
FROM Venta v
WHERE v.id_venta > 6
GROUP BY v.email_usuario

UNION ALL

SELECT 'Entradas evento ' || ev.id_evento::TEXT || ' (' || el.nombre || ' vs ' || evis.nombre || ')',
       COUNT(e.id_entrada)
FROM Entrada e
JOIN Venta v ON v.id_venta = e.id_venta
JOIN Evento ev ON ev.id_evento = e.id_evento
JOIN Equipo el ON el.id_equipo = ev.id_equipo_local
JOIN Equipo evis ON evis.id_equipo = ev.id_equipo_visitante
WHERE v.id_venta > 6
GROUP BY ev.id_evento, el.nombre, evis.nombre

ORDER BY concepto;