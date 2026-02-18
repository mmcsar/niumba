-- NIUMBA - PARTIE 2 : TYPES (Version 2)
-- Exécutez chaque ligne séparément si erreur

DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('user', 'agent', 'owner', 'admin');

DROP TYPE IF EXISTS property_type CASCADE;
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'flat', 'dormitory', 'townhouse', 'land', 'commercial', 'warehouse');

DROP TYPE IF EXISTS price_type CASCADE;
CREATE TYPE price_type AS ENUM ('sale', 'rent');

DROP TYPE IF EXISTS rent_period CASCADE;
CREATE TYPE rent_period AS ENUM ('day', 'week', 'month', 'year');

DROP TYPE IF EXISTS property_status CASCADE;
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'active', 'sold', 'rented', 'inactive');

DROP TYPE IF EXISTS inquiry_status CASCADE;
CREATE TYPE inquiry_status AS ENUM ('new', 'read', 'responded', 'closed');

DROP TYPE IF EXISTS currency_type CASCADE;
CREATE TYPE currency_type AS ENUM ('USD', 'CDF');

DROP TYPE IF EXISTS message_status CASCADE;
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

DROP TYPE IF EXISTS appointment_type CASCADE;
CREATE TYPE appointment_type AS ENUM ('in_person', 'video_call', 'phone_call');

DROP TYPE IF EXISTS appointment_status CASCADE;
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

