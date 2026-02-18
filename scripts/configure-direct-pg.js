// Niumba - Configuration Directe via PostgreSQL
// Se connecte directement à PostgreSQL pour exécuter les scripts

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string Supabase (construite avec la clé service role)
// Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
// Pour Supabase, on utilise la connection pooler ou direct

// Configuration Supabase PostgreSQL (variables d'environnement uniquement)
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const password = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PGPASSWORD;
if (!dbUrl && !password) {
  console.error('Définir SUPABASE_SERVICE_ROLE_KEY ou DATABASE_URL dans .env');
  process.exit(1);
}
const SUPABASE_DB_CONFIG = {
  host: process.env.SUPABASE_DB_HOST || 'db.YOUR_PROJECT_REF.supabase.co',
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432', 10),
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: password || 'REPLACE_VIA_ENV',
  ssl: { rejectUnauthorized: false }
};

// Alternative: Connection string directe
const CONNECTION_STRING = `postgresql://postgres:${SUPABASE_DB_CONFIG.password}@${SUPABASE_DB_CONFIG.host}:${SUPABASE_DB_CONFIG.port}/${SUPABASE_DB_CONFIG.database}?sslmode=require`;

// Lire fichier SQL
function readSQLFile(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier non trouvé: ${filename}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

// Exécuter SQL
async function executeSQL(client, sql) {
  try {
    await client.query(sql);
    return { success: true };
  } catch (error) {
    // Ignorer certaines erreurs (déjà existant, etc.)
    if (error.message.includes('already exists') || 
        error.message.includes('does not exist') ||
        error.code === '42P07' || // relation already exists
        error.code === '42710') { // duplicate object
      return { success: true, skipped: true, message: error.message };
    }
    return { success: false, error: error.message };
  }
}

// Configuration principale
async function configure() {
  console.log('🚀 Configuration Directe Supabase via PostgreSQL\n');
  console.log('=' .repeat(50) + '\n');

  const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. Connexion
    console.log('1️⃣  Connexion à PostgreSQL...');
    await client.connect();
    console.log('   ✅ Connecté!\n');

    // 2. Lire scripts
    console.log('2️⃣  Lecture des scripts SQL...');
    const securityScript = readSQLFile('SECURITE_SUPABASE_COMPLETE.sql');
    const indexScript = readSQLFile('INDEX_OPTIMISATION_LUALABA_KATANGA.sql');
    console.log('   ✅ Scripts chargés\n');

    // 3. Exécuter script de sécurité
    console.log('3️⃣  Exécution du script de sécurité...');
    const securityResult = await executeSQL(client, securityScript);
    if (securityResult.success) {
      console.log('   ✅ Sécurité configurée\n');
    } else {
      console.log(`   ⚠️  ${securityResult.error}\n`);
    }

    // 4. Exécuter script d'index
    console.log('4️⃣  Création des index d\'optimisation...');
    const indexResult = await executeSQL(client, indexScript);
    if (indexResult.success) {
      console.log('   ✅ Index créés\n');
    } else {
      console.log(`   ⚠️  ${indexResult.error}\n`);
    }

    // 5. Vérification
    console.log('5️⃣  Vérification...');
    const { rows: rlsCheck } = await client.query(`
      SELECT 
        tablename,
        CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as rls
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'properties', 'saved_properties')
      ORDER BY tablename;
    `);
    
    console.log('   📊 Statut RLS:');
    rlsCheck.forEach(row => {
      console.log(`      ${row.tablename}: ${row.rls}`);
    });
    console.log('');

    console.log('=' .repeat(50));
    console.log('✨ Configuration terminée avec succès!');
    console.log('=' .repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 La clé service role ne peut pas être utilisée comme mot de passe PostgreSQL');
      console.log('   Utilisez plutôt le SQL Editor dans Supabase Dashboard');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Impossible de se connecter. Vérifiez les credentials');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Exécuter
if (require.main === module) {
  configure()
    .then(() => {
      console.log('✅ Terminé!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { configure };


