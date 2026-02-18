// Niumba - Configuration Automatique Supabase
// Utilise la clé service role pour configurer directement

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration (utiliser les variables d'environnement, jamais de clé en dur)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Lire fichier SQL
function readSQLFile(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier non trouvé: ${filename}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

// Exécuter SQL via Supabase (méthode alternative)
async function executeSQLChunks(sqlScript) {
  console.log('📝 Préparation de l\'exécution SQL...\n');
  
  // Diviser en chunks exécutables
  const chunks = sqlScript
    .split(';')
    .map(c => c.trim())
    .filter(c => c.length > 0 && !c.startsWith('--') && !c.startsWith('DO $$'));

  console.log(`📊 ${chunks.length} commandes à exécuter\n`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // Ignorer les commentaires et blocs spéciaux
    if (chunk.startsWith('--') || chunk.includes('DO $$') || chunk.length < 10) {
      skipped++;
      continue;
    }

    try {
      // Essayer d'exécuter via RPC (si disponible)
      const { error } = await supabase.rpc('exec_sql', { query: chunk });
      
      if (error) {
        // Si RPC n'existe pas, on ne peut pas exécuter directement
        // On affiche juste l'info
        if (i < 5) {
          console.log(`⚠️  Commande ${i + 1}: ${error.message.substring(0, 50)}...`);
        }
        errors++;
      } else {
        success++;
        if (success % 10 === 0) {
          console.log(`✅ ${success} commandes exécutées...`);
        }
      }
    } catch (err) {
      errors++;
    }
  }

  console.log(`\n📊 Résultats:`);
  console.log(`   ✅ Réussies: ${success}`);
  console.log(`   ⏭️  Ignorées: ${skipped}`);
  console.log(`   ❌ Erreurs: ${errors}\n`);

  return { success, skipped, errors };
}

// Configuration principale
async function configure() {
  console.log('🚀 Configuration Automatique Supabase - Niumba\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // 1. Vérifier connexion
    console.log('1️⃣  Vérification de la connexion...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.log(`   ⚠️  ${error.message}\n`);
    } else {
      console.log('   ✅ Connexion réussie\n');
    }

    // 2. Lire et préparer les scripts
    console.log('2️⃣  Lecture des scripts SQL...');
    const securityScript = readSQLFile('SECURITE_SUPABASE_COMPLETE.sql');
    const indexScript = readSQLFile('INDEX_OPTIMISATION_LUALABA_KATANGA.sql');
    console.log('   ✅ Scripts chargés\n');

    // 3. Afficher instructions
    console.log('3️⃣  Instructions d\'exécution:\n');
    console.log('   ⚠️  Supabase ne permet pas l\'exécution SQL directe via API');
    console.log('   💡 Méthode recommandée: SQL Editor\n');
    console.log('   📋 Étapes:');
    console.log('   1. Allez dans Supabase Dashboard → SQL Editor');
    console.log('   2. Ouvrez: supabase/SECURITE_SUPABASE_COMPLETE.sql');
    console.log('   3. Copiez-collez et exécutez');
    console.log('   4. Répétez avec: INDEX_OPTIMISATION_LUALABA_KATANGA.sql\n');

    // 4. Créer fichiers de sortie pour faciliter la copie
    console.log('4️⃣  Création de fichiers prêts à copier...');
    const outputDir = path.join(__dirname, '..', 'scripts-ready');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, '1_SECURITE.sql'),
      securityScript
    );
    fs.writeFileSync(
      path.join(outputDir, '2_INDEX.sql'),
      indexScript
    );

    console.log(`   ✅ Fichiers créés dans: ${outputDir}\n`);

    // 5. Résumé
    console.log('5️⃣  Résumé:\n');
    console.log('   📁 Fichiers prêts:');
    console.log('      - scripts-ready/1_SECURITE.sql');
    console.log('      - scripts-ready/2_INDEX.sql\n');
    console.log('   🎯 Prochaine étape:');
    console.log('      Copiez-collez ces fichiers dans Supabase SQL Editor\n');

    console.log('=' .repeat(50));
    console.log('✨ Configuration préparée avec succès!');
    console.log('=' .repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.log('\n💡 Solution: Utilisez le SQL Editor dans Supabase Dashboard');
    process.exit(1);
  }
}

// Exécuter
if (require.main === module) {
  configure()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { configure };


