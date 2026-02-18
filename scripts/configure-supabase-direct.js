// Niumba - Configuration Supabase Directe via API
// Utilise la clé service role pour configurer directement

const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env');
  process.exit(1);
}

// Fonction pour exécuter SQL via REST API
async function executeSQLDirect(sql) {
  return new Promise((resolve, reject) => {
    const sqlEncoded = encodeURIComponent(sql);
    const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql?sql=${sqlEncoded}`;

    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    // Note: Supabase ne supporte pas exec_sql directement
    // Il faut utiliser le SQL Editor ou créer une fonction Edge
    console.log('⚠️  Supabase ne permet pas l\'exécution SQL directe via API');
    console.log('💡 Utilisez plutôt le SQL Editor dans le Dashboard');
    
    resolve({ success: false, message: 'Utilisez SQL Editor' });
  });
}

// Alternative: Utiliser Supabase Management API si disponible
async function configureViaManagementAPI() {
  console.log('🚀 Configuration Supabase via Management API\n');
  
  // Note: La meilleure méthode est d'utiliser le SQL Editor
  console.log('📝 Instructions:');
  console.log('1. Allez dans Supabase Dashboard → SQL Editor');
  console.log('2. Ouvrez: supabase/SECURITE_SUPABASE_COMPLETE.sql');
  console.log('3. Copiez-collez et exécutez');
  console.log('\n✅ C\'est la méthode la plus fiable!');
}

if (require.main === module) {
  configureViaManagementAPI();
}

module.exports = { configureViaManagementAPI };


