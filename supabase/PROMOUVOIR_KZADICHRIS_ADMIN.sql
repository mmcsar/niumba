-- ============================================
-- NIUMBA - Promouvoir kzadichris@gmail.com en Admin
-- ============================================

-- 1. Promouvoir en admin
UPDATE profiles
SET
  role = 'admin',
  is_verified = true,
  is_active = true,
  updated_at = NOW()
WHERE email = 'kzadichris@gmail.com';

-- 2. Vérifier le résultat
SELECT
  id,
  email,
  full_name,
  role,
  is_verified,
  is_active,
  created_at,
  updated_at
FROM profiles
WHERE email = 'kzadichris@gmail.com';

-- 3. Message de confirmation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE email = 'kzadichris@gmail.com' AND role = 'admin') THEN
    RAISE NOTICE '✅ kzadichris@gmail.com est maintenant admin !';
  ELSE
    RAISE NOTICE '❌ Erreur : Le compte n''a pas été trouvé ou n''a pas été promu en admin.';
  END IF;
END $$;


