// Test de connexion Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Définir SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Test de connexion Supabase...\n');

  // Test 1: Connexion basique
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Table "profiles" n\'existe pas encore');
        console.log('    → Il faut créer les tables dans Supabase\n');
      } else {
        console.log('❌ Erreur:', error.message);
      }
    } else {
      console.log('✅ Connexion OK! Table profiles existe\n');
    }
  } catch (e) {
    console.log('❌ Erreur de connexion:', e.message);
  }

  // Test 2: Lister les tables existantes
  try {
    const tables = ['profiles', 'properties', 'saved_properties', 'inquiries', 
                   'appointments', 'reviews', 'conversations', 'messages', 
                   'notifications', 'search_alerts'];
    
    console.log('📋 Vérification des tables:\n');
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error && error.code === '42P01') {
        console.log(`   ❌ ${table} - N'EXISTE PAS`);
      } else if (error) {
        console.log(`   ⚠️  ${table} - Erreur: ${error.message}`);
      } else {
        console.log(`   ✅ ${table} - OK`);
      }
    }
  } catch (e) {
    console.log('Erreur:', e.message);
  }

  console.log('\n========================');
  console.log('Test terminé!');
}

testConnection();



