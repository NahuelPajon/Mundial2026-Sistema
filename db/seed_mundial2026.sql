-- ============================================================
-- DATOS DE PRUEBA - SISTEMA DE TICKETING MUNDIAL 2026
-- ============================================================

-- ------------------------------------------------------------
-- PERFILES
-- ------------------------------------------------------------
INSERT INTO Perfil (email, pais_dir, localidad, calle, numero_dir, cod_postal, doc_pais, doc_tipo, doc_numero, password_hash) VALUES
('admin.usa@mundial.com',       'USA',       'New York',         'Broadway',         '100',  '10001', 'USA',       'Passport',  'US123456', crypt('Password123!', gen_salt('bf'))),
('admin.mex@mundial.com',       'México',    'Ciudad de México',  'Reforma',          '200',  '06600', 'México',    'INE',       'MX789012', crypt('Password123!', gen_salt('bf'))),
('funcionario1@mundial.com',    'USA',       'Los Angeles',      'Sunset Blvd',      '300',  '90001', 'USA',       'Passport',  'US234567', crypt('Password123!', gen_salt('bf'))),
('funcionario2@mundial.com',    'México',    'Guadalajara',      'Independencia',    '400',  '44100', 'México',    'INE',       'MX345678', crypt('Password123!', gen_salt('bf'))),
('juan.perez@gmail.com',        'Uruguay',   'Montevideo',       '18 de Julio',      '1234', '11200', 'Uruguay',   'CI',        'UY111111', crypt('Password123!', gen_salt('bf'))),
('maria.garcia@gmail.com',      'Uruguay',   'Montevideo',       'Rivera',           '567',  '11300', 'Uruguay',   'CI',        'UY222222', crypt('Password123!', gen_salt('bf'))),
('carlos.lopez@gmail.com',      'Argentina', 'Buenos Aires',     'Corrientes',       '890',  'C1043', 'Argentina', 'DNI',       'AR333333', crypt('Password123!', gen_salt('bf'))),
('ana.martinez@gmail.com',      'Argentina', 'Rosario',          'Pellegrini',       '321',  'S2000', 'Argentina', 'DNI',       'AR444444', crypt('Password123!', gen_salt('bf'))),
('pedro.silva@gmail.com',       'Brasil',    'São Paulo',        'Paulista',         '1500', '01310', 'Brasil',    'CPF',       'BR555555', crypt('Password123!', gen_salt('bf'))),
('lucia.fernandez@gmail.com',   'Uruguay',   'Montevideo',       'Bulevar Artigas',  '999',  '11600', 'Uruguay',   'CI',        'UY666666', crypt('Password123!', gen_salt('bf')));

-- ------------------------------------------------------------
-- TELEFONOS
-- ------------------------------------------------------------
INSERT INTO Telefono (email_perfil, telefono) VALUES
('juan.perez@gmail.com',        '+598 99 111 111'),
('juan.perez@gmail.com',        '+598 99 111 222'),
('maria.garcia@gmail.com',      '+598 99 222 333'),
('carlos.lopez@gmail.com',      '+54 11 3333 4444'),
('ana.martinez@gmail.com',      '+54 341 444 5555'),
('pedro.silva@gmail.com',       '+55 11 5555 6666'),
('lucia.fernandez@gmail.com',   '+598 99 666 777'),
('funcionario1@mundial.com',    '+1 310 111 2222'),
('funcionario2@mundial.com',    '+52 33 2222 3333');

-- ------------------------------------------------------------
-- ADMINS
-- ------------------------------------------------------------
INSERT INTO Admin (email_perfil, fecha_asignacion) VALUES
('admin.usa@mundial.com',   '2025-01-15'),
('admin.mex@mundial.com',   '2025-01-15');

-- ------------------------------------------------------------
-- FUNCIONARIOS
-- ------------------------------------------------------------
INSERT INTO Funcionario (email_perfil, nro_legajo) VALUES
('funcionario1@mundial.com',    'LEG-001'),
('funcionario2@mundial.com',    'LEG-002');

-- ------------------------------------------------------------
-- USUARIOS
-- ------------------------------------------------------------
INSERT INTO Usuario (email_perfil, fecha_registro, estado_verificacion) VALUES
('juan.perez@gmail.com',        '2025-03-01', 'verificado'),
('maria.garcia@gmail.com',      '2025-03-05', 'verificado'),
('carlos.lopez@gmail.com',      '2025-03-10', 'verificado'),
('ana.martinez@gmail.com',      '2025-03-12', 'pendiente'),
('pedro.silva@gmail.com',       '2025-03-15', 'verificado'),
('lucia.fernandez@gmail.com',   '2025-03-20', 'verificado');

-- ------------------------------------------------------------
-- EQUIPOS
-- ------------------------------------------------------------
INSERT INTO Equipo (id_equipo, nombre, pais) VALUES
(1,  'Uruguay',   'Uruguay'),
(2,  'Argentina', 'Argentina'),
(3,  'Brasil',    'Brasil'),
(4,  'Francia',   'Francia'),
(5,  'España',    'España'),
(6,  'Alemania',  'Alemania'),
(7,  'Portugal',  'Portugal'),
(8,  'México',    'México');

-- ------------------------------------------------------------
-- ESTADIOS
-- ------------------------------------------------------------
INSERT INTO Estadio (id_estadio, nombre, aforo, pais_dir, localidad, calle, numero_dir) VALUES
(1, 'MetLife Stadium',      82500, 'USA',    'East Rutherford', 'MetLife Stadium Dr',   '1'),
(2, 'SoFi Stadium',         70240, 'USA',    'Inglewood',       'Stadium Dr',           '1001'),
(3, 'Estadio Azteca',       87500, 'México', 'Ciudad de México', 'Insurgentes Sur',     '3465');

-- ------------------------------------------------------------
-- SECTORES
-- ------------------------------------------------------------
INSERT INTO Sector (id_estadio, codigo, capacidad_maxima, costo) VALUES
(1, 'A', 20000, 500.00),
(1, 'B', 25000, 350.00),
(1, 'C', 22000, 250.00),
(1, 'D', 15500, 150.00),
(2, 'A', 18000, 480.00),
(2, 'B', 20000, 320.00),
(2, 'C', 18000, 220.00),
(2, 'D', 14240, 120.00),
(3, 'A', 22000, 450.00),
(3, 'B', 25000, 300.00),
(3, 'C', 25000, 200.00),
(3, 'D', 15500, 100.00);

-- ------------------------------------------------------------
-- EVENTOS
-- ------------------------------------------------------------
INSERT INTO Evento (id_evento, fecha, estado, id_estadio, email_admin, id_equipo_local, id_equipo_visitante) VALUES
(1, '2026-07-02 18:00:00', 'programado', 1, 'admin.usa@mundial.com', 1, 2),  -- Uruguay vs Argentina
(2, '2026-07-04 21:00:00', 'programado', 1, 'admin.usa@mundial.com', 3, 4),  -- Brasil vs Francia
(3, '2026-07-06 18:00:00', 'programado', 2, 'admin.usa@mundial.com', 5, 6),  -- España vs Alemania
(4, '2026-07-08 21:00:00', 'programado', 3, 'admin.mex@mundial.com', 8, 7);  -- México vs Portugal

-- ------------------------------------------------------------
-- EVENTO_SECTOR (sectores habilitados por evento)
-- ------------------------------------------------------------
INSERT INTO Evento_Sector (id_evento, id_estadio, codigo_sector) VALUES
(1, 1, 'A'), (1, 1, 'B'), (1, 1, 'C'), (1, 1, 'D'),
(2, 1, 'A'), (2, 1, 'B'), (2, 1, 'C'), (2, 1, 'D'),
(3, 2, 'A'), (3, 2, 'B'), (3, 2, 'C'), (3, 2, 'D'),
(4, 3, 'A'), (4, 3, 'B'), (4, 3, 'C'), (4, 3, 'D');

-- ------------------------------------------------------------
-- TASA DE COMISION
-- ------------------------------------------------------------
INSERT INTO Tasa_Comision (id_tasa, porcentaje, fecha_desde, fecha_hasta) VALUES
(1, 5.00, '2025-01-01', '2025-12-31'),
(2, 5.00, '2026-01-01', NULL);

-- ------------------------------------------------------------
-- VENTAS
-- ------------------------------------------------------------
INSERT INTO Venta (id_venta, fecha, estado, monto_total, cantidad_comprada, email_usuario, id_tasa) VALUES
(1, '2026-05-01 10:00:00', 'paga',       1837.50, 3, 'juan.perez@gmail.com',      2),  -- 3 entradas sector B evento 1: 3*350 + 5% = 1102.50... ajustado con mix
(2, '2026-05-02 11:00:00', 'paga',       525.00,  1, 'maria.garcia@gmail.com',    2),  -- 1 entrada sector A evento 1: 500 + 5%
(3, '2026-05-03 12:00:00', 'paga',       1050.00, 2, 'carlos.lopez@gmail.com',    2),  -- 2 entradas sector A evento 2
(4, '2026-05-04 13:00:00', 'confirmada', 262.50,  1, 'ana.martinez@gmail.com',    2),  -- 1 entrada sector D evento 1
(5, '2026-05-05 14:00:00', 'paga',       472.50,  3, 'pedro.silva@gmail.com',     2),  -- 3 entradas sector D evento 3
(6, '2026-05-06 15:00:00', 'paga',       2625.00, 5, 'lucia.fernandez@gmail.com', 2);  -- 5 entradas sector A evento 4

-- ------------------------------------------------------------
-- ENTRADAS
-- ------------------------------------------------------------
INSERT INTO Entrada (id_entrada, titular, id_venta, id_evento, id_estadio, codigo_sector, consumida) VALUES
-- Venta 1: juan.perez compra 3 entradas sector B evento 1
(1,  'juan.perez@gmail.com',      1, 1, 1, 'B', FALSE),
(2,  'juan.perez@gmail.com',      1, 1, 1, 'B', FALSE),
(3,  'juan.perez@gmail.com',      1, 1, 1, 'B', FALSE),
-- Venta 2: maria.garcia compra 1 entrada sector A evento 1
(4,  'maria.garcia@gmail.com',    2, 1, 1, 'A', FALSE),
-- Venta 3: carlos.lopez compra 2 entradas sector A evento 2
(5,  'carlos.lopez@gmail.com',    3, 2, 1, 'A', FALSE),
(6,  'carlos.lopez@gmail.com',    3, 2, 1, 'A', FALSE),
-- Venta 4: ana.martinez compra 1 entrada sector D evento 1
(7,  'ana.martinez@gmail.com',    4, 1, 1, 'D', FALSE),
-- Venta 5: pedro.silva compra 3 entradas sector D evento 3
(8,  'pedro.silva@gmail.com',     5, 3, 2, 'D', FALSE),
(9,  'pedro.silva@gmail.com',     5, 3, 2, 'D', FALSE),
(10, 'pedro.silva@gmail.com',     5, 3, 2, 'D', FALSE),
-- Venta 6: lucia.fernandez compra 5 entradas sector A evento 4
(11, 'lucia.fernandez@gmail.com', 6, 4, 3, 'A', FALSE),
(12, 'lucia.fernandez@gmail.com', 6, 4, 3, 'A', FALSE),
(13, 'lucia.fernandez@gmail.com', 6, 4, 3, 'A', FALSE),
(14, 'lucia.fernandez@gmail.com', 6, 4, 3, 'A', FALSE),
(15, 'lucia.fernandez@gmail.com', 6, 4, 3, 'A', FALSE);

-- ------------------------------------------------------------
-- TRANSFERENCIAS (juan le transfiere una entrada a carlos)
-- ------------------------------------------------------------
INSERT INTO Transferencia (id_transferencia, id_entrada, email_origen, email_destino, fecha_solicitud, fecha_aceptacion, estado) VALUES
(1, 3, 'juan.perez@gmail.com', 'carlos.lopez@gmail.com', '2026-05-10 09:00:00', '2026-05-10 10:30:00', 'aceptada');

-- actualizar titular de entrada 3 tras transferencia aceptada
UPDATE Entrada SET titular = 'carlos.lopez@gmail.com' WHERE id_entrada = 3;

-- ------------------------------------------------------------
-- HISTORIAL DE TRANSFERENCIAS
-- ------------------------------------------------------------
INSERT INTO Historial_Transferencia (id_entrada, id_transferencia, orden) VALUES
(3, 1, 1);

-- ------------------------------------------------------------
-- QR (tokens activos por entrada)
-- ------------------------------------------------------------
INSERT INTO QR (token, id_entrada, generado_en, expira_en, activo) VALUES
('QR-TOKEN-001', 1,  '2026-07-01 12:00:00', '2026-07-01 12:00:30', TRUE),
('QR-TOKEN-002', 2,  '2026-07-01 12:00:00', '2026-07-01 12:00:30', TRUE),
('QR-TOKEN-003', 3,  '2026-07-01 12:00:00', '2026-07-01 12:00:30', TRUE),
('QR-TOKEN-004', 4,  '2026-07-01 12:00:00', '2026-07-01 12:00:30', TRUE);

-- ------------------------------------------------------------
-- DISPOSITIVOS
-- ------------------------------------------------------------
INSERT INTO Dispositivo (id_dispositivo, descripcion, email_funcionario) VALUES
(1, 'Scanner puerta norte - MetLife',   'funcionario1@mundial.com'),
(2, 'Scanner puerta este - Azteca',     'funcionario2@mundial.com');

-- ------------------------------------------------------------
-- VALIDACIONES (simulamos el ingreso de algunos usuarios)
-- ------------------------------------------------------------
INSERT INTO Validacion (id_validacion, fecha, id_entrada, token_qr, id_dispositivo, email_funcionario) VALUES
(1, '2026-06-15 18:02:00', 1, 'QR-TOKEN-001', 1, 'funcionario1@mundial.com'),
(2, '2026-06-15 18:03:00', 4, 'QR-TOKEN-004', 1, 'funcionario1@mundial.com');

-- marcar esas entradas como consumidas
UPDATE Entrada SET consumida = TRUE WHERE id_entrada IN (1, 4);
UPDATE QR SET activo = FALSE WHERE token IN ('QR-TOKEN-001', 'QR-TOKEN-004');

-- ------------------------------------------------------------
-- SINCRONIZAR SECUENCIAS (para INSERT sin ID explícito desde la app)
-- ------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('equipo', 'id_equipo'), COALESCE((SELECT MAX(id_equipo) FROM equipo), 1), true);
SELECT setval(pg_get_serial_sequence('estadio', 'id_estadio'), COALESCE((SELECT MAX(id_estadio) FROM estadio), 1), true);
SELECT setval(pg_get_serial_sequence('evento', 'id_evento'), COALESCE((SELECT MAX(id_evento) FROM evento), 1), true);
SELECT setval(pg_get_serial_sequence('tasa_comision', 'id_tasa'), COALESCE((SELECT MAX(id_tasa) FROM tasa_comision), 1), true);
SELECT setval(pg_get_serial_sequence('venta', 'id_venta'), COALESCE((SELECT MAX(id_venta) FROM venta), 1), true);
SELECT setval(pg_get_serial_sequence('entrada', 'id_entrada'), COALESCE((SELECT MAX(id_entrada) FROM entrada), 1), true);
SELECT setval(pg_get_serial_sequence('transferencia', 'id_transferencia'), COALESCE((SELECT MAX(id_transferencia) FROM transferencia), 1), true);
SELECT setval(pg_get_serial_sequence('dispositivo', 'id_dispositivo'), COALESCE((SELECT MAX(id_dispositivo) FROM dispositivo), 1), true);
SELECT setval(pg_get_serial_sequence('validacion', 'id_validacion'), COALESCE((SELECT MAX(id_validacion) FROM validacion), 1), true);