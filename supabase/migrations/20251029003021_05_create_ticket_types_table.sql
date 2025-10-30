-- ============================================
-- TABLE ticket_types
-- ============================================

CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  prix DECIMAL(10, 2) NOT NULL,
  quantite_disponible INTEGER DEFAULT 0 NOT NULL,
  quantite_vendue INTEGER DEFAULT 0 NOT NULL,
  avantages TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT check_prix CHECK (prix >= 0),
  CONSTRAINT check_quantites CHECK (quantite_vendue <= quantite_disponible)
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);

ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ticket types are viewable by everyone" ON ticket_types;
CREATE POLICY "Ticket types are viewable by everyone"
  ON ticket_types FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Organisateurs can manage ticket types" ON ticket_types;
CREATE POLICY "Organisateurs can manage ticket types"
  ON ticket_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_types.event_id
      AND events.organisateur_id = auth.uid()
    )
  );
