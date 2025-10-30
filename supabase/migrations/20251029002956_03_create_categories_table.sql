-- ============================================
-- TABLE categories
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT UNIQUE NOT NULL,
  description TEXT,
  icone TEXT DEFAULT 'folder',
  couleur TEXT DEFAULT '#2563EB',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

INSERT INTO categories (nom, description, icone, couleur) VALUES
  ('Concerts', 'Concerts et spectacles musicaux', 'music', '#F97316'),
  ('Conférences', 'Conférences professionnelles et événements d''affaires', 'briefcase', '#2563EB'),
  ('Spectacles', 'Théâtre, danse, comédie', 'drama', '#FDB022'),
  ('Sports', 'Événements sportifs', 'trophy', '#10B981'),
  ('Festivals', 'Festivals et événements culturels', 'party-popper', '#8B5CF6')
ON CONFLICT (nom) DO NOTHING;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated
  USING (true);
