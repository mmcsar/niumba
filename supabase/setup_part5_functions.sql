-- ============================================
-- NIUMBA - PARTIE 5 : FONCTIONS ET TRIGGERS
-- Copiez et exécutez ce script après la partie 4
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
DROP TRIGGER IF EXISTS profiles_updated ON profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS properties_updated ON properties;
CREATE TRIGGER properties_updated BEFORE UPDATE ON properties 
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS appointments_updated ON appointments;
CREATE TRIGGER appointments_updated BEFORE UPDATE ON appointments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer profil à l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_property_views(property_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE properties SET views = views + 1 WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les créneaux disponibles
CREATE OR REPLACE FUNCTION get_available_slots(
  p_property_id UUID,
  p_date DATE
)
RETURNS TABLE (slot_time TIME) AS $$
DECLARE
  current_slot TIME;
BEGIN
  current_slot := '08:00'::TIME;
  WHILE current_slot < '18:00'::TIME LOOP
    IF NOT EXISTS (
      SELECT 1 FROM appointments
      WHERE property_id = p_property_id 
        AND appointment_date = p_date
        AND appointment_time = current_slot 
        AND status NOT IN ('cancelled', 'no_show')
    ) THEN
      slot_time := current_slot;
      RETURN NEXT;
    END IF;
    current_slot := current_slot + INTERVAL '30 minutes';
  END LOOP;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Message de succès
SELECT 'Niumba database setup complete!' AS status;

