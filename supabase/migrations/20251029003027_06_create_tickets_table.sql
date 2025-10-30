-- ============================================
-- TABLE tickets
-- ============================================

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE RESTRICT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE RESTRICT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  code_billet TEXT UNIQUE NOT NULL,
  nom_participant TEXT NOT NULL,
  email_participant TEXT NOT NULL,
  prix_paye DECIMAL(10, 2) NOT NULL,
  statut ticket_status DEFAULT 'valide' NOT NULL,
  qr_code_url TEXT,
  date_achat TIMESTAMPTZ DEFAULT now() NOT NULL,
  date_utilisation TIMESTAMPTZ,

  CONSTRAINT check_prix_paye CHECK (prix_paye >= 0)
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(code_billet);
CREATE INDEX IF NOT EXISTS idx_tickets_statut ON tickets(statut);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
CREATE POLICY "Users can view own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Organisateurs can view event tickets" ON tickets;
CREATE POLICY "Organisateurs can view event tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = tickets.event_id
      AND events.organisateur_id = auth.uid()
    )
  );
