-- NIUMBA - Trigger Automatique pour Créer le Profil
-- Script PROPRE - Pas de policies, seulement le trigger

-- Fonction qui crée le profil automatiquement
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    true,
    COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger créé avec succès !';
  RAISE NOTICE '✅ Tous les nouveaux utilisateurs auront automatiquement un profil créé !';
END $$;


