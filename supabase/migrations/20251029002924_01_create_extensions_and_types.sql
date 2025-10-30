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
