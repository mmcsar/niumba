// Niumba - Configuration RLS Automatique
// Configure le RLS directement via l'API Supabase

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Lire le script SQL
function readSQLFile(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', filename);
  return fs.readFileSync(filePath, 'utf8');
}

// Exécuter SQL via Supabase REST API (méthode alternative)
async function executeSQLViaREST(sql) {
  // Supabase ne permet pas l'exécution SQL directe via REST API
  // On doit utiliser une autre méthode
  
  // Option 1: Créer une Edge Function qui exécute le SQL
  // Option 2: Utiliser pg directement avec connection string
  // Option 3: Utiliser le SQL Editor (méthode manuelle)
  
  console.log('⚠️  Supabase ne permet pas l\'exécution SQL directe via API REST');
  console.log('💡 Création d\'une Edge Function pour exécuter le SQL...\n');
  
  // Créer une Edge Function qui exécute le SQL
  const edgeFunction = `
-- Edge Function pour exécuter SQL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const { sql } = await req.json()
  
  // Exécuter le SQL
  const { data, error } = await supabase.rpc('exec_sql', { query: sql })
  
  return new Response(
    JSON.stringify({ data, error }),
    { headers: { "Content-Type": "application/json" } }
  )
})
  `;
  
  return { method: 'edge_function', code: edgeFunction };
}

// Configuration via API REST (créer policies une par une)
async function configureRLSviaAPI() {
  console.log('🚀 Configuration RLS via API Supabase\n');
  console.log('=' .repeat(50) + '\n');

  // Liste des tables et leurs policies
  const policies = [
    // Profiles
    {
      table: 'profiles',
      name: 'profiles_select_public',
      command: 'SELECT',
      definition: 'USING (true)'
    },
    {
      table: 'profiles',
      name: 'profiles_update_own',
      command: 'UPDATE',
      definition: 'USING (auth.uid() = id) WITH CHECK (auth.uid() = id)'
    },
    {
      table: 'profiles',
      name: 'profiles_insert_own',
      command: 'INSERT',
      definition: 'WITH CHECK (auth.uid() = id)'
    },
    // Properties
    {
      table: 'properties',
      name: 'properties_select_public',
      command: 'SELECT',
      definition: `USING (status = 'active' OR owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))`
    },
    {
      table: 'properties',
      name: 'properties_insert_authenticated',
      command: 'INSERT',
      definition: `WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'agent', 'admin')))`
    },
    {
      table: 'properties',
      name: 'properties_update_own',
      command: 'UPDATE',
      definition: 'USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)'
    },
    {
      table: 'properties',
      name: 'properties_delete_own',
      command: 'DELETE',
      definition: 'USING (auth.uid() = owner_id)'
    },
    {
      table: 'properties',
      name: 'properties_admin_full',
      command: 'ALL',
      definition: 'USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = \'admin\'))'
    }
  ];

  console.log('📝 Création des policies via API...\n');

  // Malheureusement, Supabase ne permet pas de créer des policies via REST API
  // Il faut utiliser le SQL Editor ou une Edge Function
  
  console.log('⚠️  Supabase ne permet pas la création de policies via REST API');
  console.log('💡 Solution: Utiliser le SQL Editor\n');
  
  console.log('📋 Instructions:');
  console.log('1. Allez dans Supabase Dashboard → SQL Editor');
  console.log('2. Ouvrez: supabase/SECURITE_SUPABASE_COMPLETE.sql');
  console.log('3. Copiez-collez et exécutez\n');
  
  return { success: false, method: 'manual' };
}

// Méthode principale
async function configure() {
  console.log('🔧 Configuration RLS Automatique - Niumba\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // Essayer la méthode API
    const result = await configureRLSviaAPI();
    
    if (!result.success) {
      console.log('=' .repeat(50));
      console.log('\n📝 Alternative: Script SQL Prêt\n');
      console.log('Les scripts SQL sont prêts dans:');
      console.log('  - supabase/SECURITE_SUPABASE_COMPLETE.sql');
      console.log('  - supabase/VERIFIER_RLS_STATUS.sql\n');
      console.log('Exécutez-les dans Supabase SQL Editor.\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Utilisez le SQL Editor dans Supabase Dashboard');
  }
}

if (require.main === module) {
  configure()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { configure };


