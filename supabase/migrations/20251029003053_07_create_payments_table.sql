-- ============================================
-- TABLE payments
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  montant_total DECIMAL(10, 2) NOT NULL,
  frais_service DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  methode_paiement TEXT DEFAULT 'stripe' NOT NULL,
  statut payment_status DEFAULT 'en_attente' NOT NULL,
  transaction_id TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT check_montant CHECK (montant_total >= 0),
  CONSTRAINT check_frais CHECK (frais_service >= 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_statut ON payments(statut);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
