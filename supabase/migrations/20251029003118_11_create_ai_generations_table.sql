-- ============================================
-- TABLE ai_generations
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

CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_event ON ai_generations(event_id);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own generations" ON ai_generations;
CREATE POLICY "Users can view own generations"
  ON ai_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
