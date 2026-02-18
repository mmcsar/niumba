// Niumba - Vérification du Statut RLS
// Vérifie si le RLS est activé et configuré

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkRLSStatus() {
  console.log('🔍 Vérification du Statut RLS - Niumba\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // Vérifier RLS sur les tables principales
    const tables = [
      'profiles', 'properties', 'saved_properties', 'inquiries',
      'appointments', 'reviews', 'conversations', 'messages',
      'notifications', 'search_alerts', 'agents', 'cities',
      'price_history', 'property_views'
    ];

    console.log('1️⃣  Vérification RLS sur les tables...\n');

    const results = [];

    for (const table of tables) {
      try {
        // Essayer de lire la table pour vérifier si elle existe
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(0);

        if (error) {
          if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
            results.push({
              table,
              exists: false,
              rls: '❓ Table n\'existe pas',
              policies: 0
            });
            continue;
          } else if (error.code === '42501' || error.message.includes('permission denied')) {
            // Si permission denied, RLS est probablement activé
            results.push({
              table,
              exists: true,
              rls: '✅ Probablement activé (permission denied)',
              policies: '?'
            });
            continue;
          }
        }

        // Si pas d'erreur, la table existe
        results.push({
          table,
          exists: true,
          rls: '⚠️  À vérifier',
          policies: '?'
        });
      } catch (err) {
        results.push({
          table,
          exists: false,
          rls: '❌ Erreur',
          policies: 0
        });
      }
    }

    // Afficher les résultats
    console.log('📊 Résultats:\n');
    results.forEach(result => {
      console.log(`   ${result.table.padEnd(20)} | ${result.rls}`);
    });

    console.log('\n' + '=' .repeat(50));
    console.log('\n💡 Pour vérifier précisément, exécutez ce script dans Supabase SQL Editor:\n');
    console.log(`
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activé' ELSE '❌ RLS Désactivé' END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as nb_policies
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'properties', 'saved_properties', 'inquiries', 'appointments', 'reviews')
ORDER BY tablename;
    `);

    console.log('\n📝 Conclusion:\n');
    
    const tablesWithRLS = results.filter(r => r.rls.includes('✅')).length;
    const tablesWithoutRLS = results.filter(r => r.rls.includes('❌') || r.rls.includes('⚠️')).length;
    
    if (tablesWithRLS > 0) {
      console.log(`   ✅ ${tablesWithRLS} table(s) avec RLS probablement activé`);
    }
    if (tablesWithoutRLS > 0) {
      console.log(`   ⚠️  ${tablesWithoutRLS} table(s) nécessitent une vérification`);
      console.log('\n   🎯 Action requise:');
      console.log('      Exécutez: supabase/SECURITE_SUPABASE_COMPLETE.sql');
      console.log('      dans Supabase SQL Editor\n');
    }

    if (tablesWithRLS === 0 && tablesWithoutRLS > 0) {
      console.log('   ❌ RLS n\'est PAS encore configuré');
      console.log('   🔴 Action URGENTE: Exécutez le script de sécurité!\n');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.log('\n💡 Solution: Vérifiez manuellement dans Supabase Dashboard');
  }
}

if (require.main === module) {
  checkRLSStatus()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { checkRLSStatus };


