\set ON_ERROR_STOP on

SELECT (COUNT(*) = 0) AS should_seed FROM perfil \gset

\if :should_seed
\echo 'Base vacia: cargando seed_mundial2026.sql...'
\ir /docker-entrypoint-initdb.d/seed_mundial2026.sql
\echo 'Seed cargado correctamente.'
\else
\echo 'Seed ya presente, omitiendo carga.'
\endif
