-- Migración para bases existentes sin password_hash (ejecutar manualmente si no recreás el volumen)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE Perfil ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

UPDATE Perfil
SET password_hash = crypt('Password123!', gen_salt('bf'))
WHERE password_hash IS NULL;

ALTER TABLE Perfil ALTER COLUMN password_hash SET NOT NULL;
