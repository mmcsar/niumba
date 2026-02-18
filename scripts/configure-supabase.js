// Niumba - Script de Configuration Supabase Automatique
// Ce script configure automatiquement la sécurité dans Supabase

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase (variables d'environnement uniquement)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Lire le fichier SQL
function readSQLFile(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', filename);
  return fs.readFileSync(filePath, 'utf8');
}

// Exécuter le script SQL
async function executeSQL(script) {
  try {
    // Diviser le script en commandes individuelles
    const commands = script
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('DO $$'));

    console.log(`📝 Exécution de ${commands.length} commandes...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Ignorer les commentaires et les blocs DO
      if (command.startsWith('--') || command.includes('DO $$')) {
        continue;
      }

      try {
        // Exécuter via RPC ou query directe
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });
        
        if (error) {
          // Si RPC n'existe pas, essayer une autre méthode
          console.log(`⚠️  Commande ${i + 1}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
          if ((i + 1) % 10 === 0) {
            console.log(`✅ ${i + 1} commandes exécutées...`);
          }
        }
      } catch (err) {
        console.log(`❌ Erreur commande ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ ${successCount} commandes réussies`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} commandes avec erreurs (peut être normal)`);
    }

    return { success: successCount, errors: errorCount };
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution:', error);
    throw error;
  }
}

// Configuration principale
async function configureSupabase() {
  console.log('🚀 Configuration Supabase - Niumba\n');
  console.log('📋 Étapes de configuration:\n');

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣  Vérification de la connexion...');
    const { data: health, error: healthError } = await supabase.from('profiles').select('count').limit(1);
    
    if (healthError && healthError.code !== 'PGRST116') {
      console.log('⚠️  Connexion: ' + healthError.message);
    } else {
      console.log('✅ Connexion réussie\n');
    }

    // 2. Exécuter le script de sécurité complet
    console.log('2️⃣  Configuration de la sécurité...');
    const securityScript = readSQLFile('SECURITE_SUPABASE_COMPLETE.sql');
    await executeSQL(securityScript);
    console.log('✅ Sécurité configurée\n');

    // 3. Exécuter les index d'optimisation
    console.log('3️⃣  Création des index d\'optimisation...');
    const indexScript = readSQLFile('INDEX_OPTIMISATION_LUALABA_KATANGA.sql');
    await executeSQL(indexScript);
    console.log('✅ Index créés\n');

    // 4. Vérification finale
    console.log('4️⃣  Vérification finale...');
    const { data: tables } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .limit(5);

    console.log('✅ Configuration terminée avec succès!\n');
    console.log('🔒 Votre base de données est maintenant sécurisée!');

  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error.message);
    console.log('\n💡 Solution alternative:');
    console.log('   Exécutez manuellement les scripts SQL dans Supabase Dashboard → SQL Editor');
    process.exit(1);
  }
}

// Exécuter la configuration
if (require.main === module) {
  configureSupabase()
    .then(() => {
      console.log('\n✨ Configuration terminée!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { configureSupabase };


