-- ============================================
-- NIUMBA - Trigger pour Créer Automatiquement un Profil
-- ============================================
-- 
-- Ce trigger crée automatiquement un profil dans la table profiles
-- quand un nouvel utilisateur est créé dans auth.users
-- ============================================

-- 1. Fonction pour créer le profil automatiquement
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'user'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    true,
    COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger (supprimer l'ancien s'il existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Vérifier que le trigger est créé
SELECT 
  'Trigger créé' as verification,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- 4. Message de confirmation
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Trigger créé avec succès !';
    RAISE NOTICE '✅ Un profil sera automatiquement créé pour chaque nouvel utilisateur';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '❌ Erreur : Le trigger n''a pas été créé';
    RAISE NOTICE '';
  END IF;
END $$;
