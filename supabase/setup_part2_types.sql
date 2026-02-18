-- ============================================
-- NIUMBA - PARTIE 2 : TYPES ENUM
-- Copiez et exécutez ce script après la partie 1
-- ============================================

-- Si les types existent déjà, ignorez les erreurs
CREATE TYPE user_role AS ENUM ('user', 'agent', 'owner', 'admin');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'flat', 'dormitory', 'townhouse', 'land', 'commercial', 'warehouse');
CREATE TYPE price_type AS ENUM ('sale', 'rent');
CREATE TYPE rent_period AS ENUM ('day', 'week', 'month', 'year');
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'active', 'sold', 'rented', 'inactive');
CREATE TYPE inquiry_status AS ENUM ('new', 'read', 'responded', 'closed');
CREATE TYPE currency_type AS ENUM ('USD', 'CDF');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE appointment_type AS ENUM ('in_person', 'video_call', 'phone_call');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

