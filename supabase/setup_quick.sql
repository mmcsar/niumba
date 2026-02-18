-- ============================================
-- NIUMBA - Setup Rapide Base de Données
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Type pour les rôles utilisateurs
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'agent', 'owner', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Table PROFILES (utilisateurs)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role user_role DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Politique: tout le monde peut voir les profils
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);

-- 6. Politique: chacun peut modifier son profil
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 7. Politique: insertion de son propre profil
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Fonction pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger pour auto-création de profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Créer le profil pour Christian s'il existe dans auth.users
INSERT INTO profiles (id, email, full_name, company_name, role, is_verified)
SELECT 
  id,
  email,
  'Christian',
  'MMC SARL',
  'admin',
  TRUE
FROM auth.users 
WHERE email = 'christian@maintenancemc.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_verified = TRUE,
  full_name = 'Christian',
  company_name = 'MMC SARL';

-- 11. Vérification finale
SELECT 
  email,
  full_name,
  role,
  is_verified,
  company_name
FROM profiles 
WHERE email = 'christian@maintenancemc.com';

