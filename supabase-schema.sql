/*
  # ONEWAYTICKET - Schéma Base de Données PostgreSQL

  ## Description
  Base de données complète pour l'application de billetterie événementielle ONEWAYTICKET

  ## Tables
  1. users - Utilisateurs (clients, organisateurs, admins)
  2. categories - Catégories d'événements
  3. events - Événements publiés
  4. ticket_types - Types de billets par événement
  5. tickets - Billets achetés
  6. payments - Transactions de paiement
  7. payment_tickets - Liaison paiements-billets
  8. reviews - Avis et notations
  9. favorites - Événements favoris
  10. ai_generations - Historique générations IA

  ## Sécurité
  - Row Level Security (RLS) activé sur toutes les tables
  - Policies restrictives par défaut
*/

-- ============================================
-- 1. EXTENSION UUID
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TYPES ENUM
-- ============================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'organisateur', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('brouillon', 'publie', 'annule', 'termine');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('valide', 'utilise', 'annule', 'rembourse');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('en_attente', 'complete', 'echoue', 'rembourse');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 3. TABLE users
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT,
  role user_role DEFAULT 'client' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. TABLE categories
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT UNIQUE NOT NULL,
  description TEXT,
  icone TEXT DEFAULT 'folder',
  couleur TEXT DEFAULT '#2563EB',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Données par défaut
INSERT INTO categories (nom, description, icone, couleur) VALUES
  ('Concerts', 'Concerts et spectacles musicaux', 'music', '#F97316'),
  ('Conférences', 'Conférences professionnelles et événements d''affaires', 'briefcase', '#2563EB'),
  ('Spectacles', 'Théâtre, danse, comédie', 'drama', '#FDB022'),
  ('Sports', 'Événements sportifs', 'trophy', '#10B981'),
  ('Festivals', 'Festivals et événements culturels', 'party-popper', '#8B5CF6')
ON CONFLICT (nom) DO NOTHING;

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 5. TABLE events
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

-- Index pour recherche et filtrage
CREATE INDEX IF NOT EXISTS idx_events_organisateur ON events(organisateur_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_statut ON events(statut);
CREATE INDEX IF NOT EXISTS idx_events_date_debut ON events(date_debut);
CREATE INDEX IF NOT EXISTS idx_events_ville ON events(ville);

-- RLS
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

-- ============================================
-- 6. TABLE ticket_types
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

-- Index
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);

-- RLS
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

-- ============================================
-- 7. TABLE tickets
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

-- Index
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(code_billet);
CREATE INDEX IF NOT EXISTS idx_tickets_statut ON tickets(statut);

-- RLS
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

-- ============================================
-- 8. TABLE payments
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

-- Index
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_statut ON payments(statut);

-- RLS
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

-- ============================================
-- 9. TABLE payment_tickets (Liaison)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_tickets (
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (payment_id, ticket_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_payment_tickets_payment ON payment_tickets(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_tickets_ticket ON payment_tickets(ticket_id);

-- RLS
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

-- ============================================
-- 10. TABLE reviews
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  note INTEGER NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT check_note CHECK (note >= 1 AND note <= 5),
  CONSTRAINT unique_review UNIQUE (event_id, user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_event ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 11. TABLE favorites
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, event_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_event ON favorites(event_id);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 12. TABLE ai_generations
-- ============================================

CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_event ON ai_generations(event_id);

-- RLS
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own generations" ON ai_generations;
CREATE POLICY "Users can view own generations"
  ON ai_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 13. VUES POUR STATISTIQUES
-- ============================================

-- Vue statistiques événements
CREATE OR REPLACE VIEW event_stats AS
SELECT
  e.id,
  e.titre,
  COUNT(DISTINCT t.id) as total_billets_vendus,
  COALESCE(SUM(t.prix_paye), 0) as revenus_total,
  COALESCE(AVG(r.note), 0) as note_moyenne,
  COUNT(DISTINCT r.id) as nombre_avis,
  e.capacite_totale,
  ROUND((COUNT(DISTINCT t.id)::DECIMAL / NULLIF(e.capacite_totale, 0)) * 100, 2) as taux_remplissage
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id AND t.statut = 'valide'
LEFT JOIN reviews r ON e.id = r.event_id
GROUP BY e.id, e.titre, e.capacite_totale;

-- ============================================
-- 14. FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour générer un code billet unique
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'OWT-' ||
            LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' ||
            LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    SELECT EXISTS(SELECT 1 FROM tickets WHERE code_billet = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE 'Schema ONEWAYTICKET créé avec succès !';
  RAISE NOTICE 'Tables créées: 12';
  RAISE NOTICE 'Vue créée: event_stats';
  RAISE NOTICE 'Fonctions créées: 2';
  RAISE NOTICE 'RLS activé sur toutes les tables';
END $$;
