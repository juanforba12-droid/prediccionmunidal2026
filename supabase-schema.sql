-- Ejecuta esto en Supabase → SQL Editor → New Query

-- Tabla de grupos
CREATE TABLE groups (
  code        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  creator_id  TEXT NOT NULL,
  campeon_real TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de jugadores
CREATE TABLE players (
  id           TEXT PRIMARY KEY,
  group_code   TEXT REFERENCES groups(code) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  avatar       TEXT DEFAULT '⚽',
  color        TEXT DEFAULT '#e63946',
  campeon_pred TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de predicciones
CREATE TABLE predictions (
  id          BIGSERIAL PRIMARY KEY,
  group_code  TEXT REFERENCES groups(code) ON DELETE CASCADE,
  player_id   TEXT REFERENCES players(id) ON DELETE CASCADE,
  match_id    INTEGER NOT NULL,
  goals_local INTEGER,
  goals_vis   INTEGER,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_code, player_id, match_id)
);

-- Tabla de resultados reales (solo admin)
CREATE TABLE results (
  id          BIGSERIAL PRIMARY KEY,
  group_code  TEXT REFERENCES groups(code) ON DELETE CASCADE,
  match_id    INTEGER NOT NULL,
  goals_local INTEGER,
  goals_vis   INTEGER,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_code, match_id)
);

-- Permisos públicos (Row Level Security desactivado para simplificar)
ALTER TABLE groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE players     ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public access" ON groups      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON players     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public access" ON results     FOR ALL USING (true) WITH CHECK (true);

-- Realtime activado
ALTER PUBLICATION supabase_realtime ADD TABLE results;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE predictions;
