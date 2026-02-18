-- ============================================
-- Niumba - Trigger pour Création Automatique des Profils
-- ============================================
-- Ce script crée un trigger qui crée automatiquement
-- un profil dans la table 'profiles' lorsqu'un utilisateur
-- s'inscrit dans auth.users
-- ============================================

-- ============================================
-- 1. FONCTION POUR CRÉER LE PROFIL AUTOMATIQUEMENT
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    is_verified,
    is_active,
    language,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    true,
    COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. CRÉER LE TRIGGER
-- ============================================

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger qui s'exécute après l'insertion d'un utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. FONCTION POUR METTRE À JOUR LE PROFIL QUAND L'EMAIL CHANGE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour l'email dans le profil si l'email de l'utilisateur change
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles
    SET 
      email = NEW.email,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. CRÉER LE TRIGGER POUR LA MISE À JOUR DE L'EMAIL
-- ============================================

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

-- Créer le trigger qui s'exécute après la mise à jour d'un utilisateur
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_update();

-- ============================================
-- 5. VÉRIFICATION
-- ============================================

-- Vérifier que les triggers ont été créés
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- Vérifier que les fonctions ont été créées
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%user%'
ORDER BY routine_name;

