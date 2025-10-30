-- ============================================
-- TABLE payment_tickets (Liaison)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_tickets (
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (payment_id, ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_tickets_payment ON payment_tickets(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_tickets_ticket ON payment_tickets(ticket_id);

ALTER TABLE payment_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment tickets" ON payment_tickets;
CREATE POLICY "Users can view own payment tickets"
  ON payment_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = payment_tickets.payment_id
      AND payments.user_id = auth.uid()
    )
  );
