// Script pour créer le compte admin Christian
// Exécutez avec: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Définir SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdminAccount() {
  console.log('🚀 Création du compte admin Christian...\n');
  
  const email = process.env.ADMIN_EMAIL || 'christian@maintenancemc.com';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error('Définir ADMIN_PASSWORD dans .env pour créer l\'admin');
    process.exit(1);
  }
  
  try {
    // Étape 1: Créer le compte
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe: [SÉCURISÉ]\n');
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: 'Christian',
          company_name: 'MMC SARL',
        }
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️  Ce compte existe déjà!');
        console.log('👉 Connectez-vous avec vos identifiants dans l\'app\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Compte créé avec succès!');
      console.log('📋 User ID:', data.user?.id);
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('⚠️  ÉTAPE SUIVANTE - Activer le rôle Admin:');
    console.log('');
    console.log('1. Allez sur: https://supabase.com/dashboard');
    console.log('2. Ouvrez votre projet Niumba');
    console.log('3. Allez dans SQL Editor');
    console.log('4. Exécutez ce SQL:');
    console.log('');
    console.log('   UPDATE profiles');
    console.log('   SET role = \'admin\', is_verified = TRUE,');
    console.log('       full_name = \'Christian\', company_name = \'MMC SARL\'');
    console.log('   WHERE email = \'christian@maintenancemc.com\';');
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

createAdminAccount();

