-- ============================================
-- TABLE events
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisateur_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  lieu TEXT NOT NULL,
  ville TEXT NOT NULL,
  date_debut TIMESTAMPTZ NOT NULL,
  date_fin TIMESTAMPTZ NOT NULL,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  capacite_totale INTEGER DEFAULT 0 NOT NULL,
  statut event_status DEFAULT 'publie' NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT check_dates CHECK (date_fin >= date_debut),
  CONSTRAINT check_capacite CHECK (capacite_totale >= 0)
);

CREATE INDEX IF NOT EXISTS idx_events_organisateur ON events(organisateur_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_statut ON events(statut);
CREATE INDEX IF NOT EXISTS idx_events_date_debut ON events(date_debut);
CREATE INDEX IF NOT EXISTS idx_events_ville ON events(ville);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  TO authenticated
  USING (statut = 'publie' OR organisateur_id = auth.uid());

DROP POLICY IF EXISTS "Organisateurs can create events" ON events;
CREATE POLICY "Organisateurs can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organisateur_id);

DROP POLICY IF EXISTS "Organisateurs can update own events" ON events;
CREATE POLICY "Organisateurs can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organisateur_id)
  WITH CHECK (auth.uid() = organisateur_id);

DROP POLICY IF EXISTS "Organisateurs can delete own events" ON events;
CREATE POLICY "Organisateurs can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = organisateur_id);
