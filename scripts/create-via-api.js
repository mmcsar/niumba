const https = require('https');

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
if (!SERVICE_KEY || !PROJECT_REF) {
  console.error('Définir SUPABASE_SERVICE_ROLE_KEY et SUPABASE_PROJECT_REF dans .env');
  process.exit(1);
}

// Tables SQL - une par une
const TABLES = [
  {
    name: 'profiles',
    sql: `CREATE TABLE IF NOT EXISTS profiles (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, email TEXT, full_name TEXT, phone TEXT, avatar_url TEXT, role TEXT DEFAULT 'user', created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'properties', 
    sql: `CREATE TABLE IF NOT EXISTS properties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), owner_id UUID, title TEXT NOT NULL, description TEXT, price NUMERIC NOT NULL, currency TEXT DEFAULT 'XOF', property_type TEXT, transaction_type TEXT, bedrooms INTEGER, bathrooms INTEGER, area NUMERIC, address TEXT, city TEXT, status TEXT DEFAULT 'active', images TEXT[], created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'saved_properties',
    sql: `CREATE TABLE IF NOT EXISTS saved_properties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, property_id UUID, created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'inquiries',
    sql: `CREATE TABLE IF NOT EXISTS inquiries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, owner_id UUID, property_id UUID, message TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'appointments',
    sql: `CREATE TABLE IF NOT EXISTS appointments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, owner_id UUID, property_id UUID, scheduled_date DATE NOT NULL, scheduled_time TIME NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'reviews',
    sql: `CREATE TABLE IF NOT EXISTS reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, property_id UUID, rating INTEGER, comment TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'conversations',
    sql: `CREATE TABLE IF NOT EXISTS conversations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), participant1_id UUID, participant2_id UUID, property_id UUID, last_message_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'messages',
    sql: `CREATE TABLE IF NOT EXISTS messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id UUID, sender_id UUID, content TEXT NOT NULL, read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'notifications',
    sql: `CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT, data JSONB, read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW())`
  },
  {
    name: 'search_alerts',
    sql: `CREATE TABLE IF NOT EXISTS search_alerts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, name TEXT, filters JSONB NOT NULL, active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW())`
  }
];

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function checkTable(name) {
  try {
    const res = await makeRequest('GET', `/rest/v1/${name}?limit=0`);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🪄 Création des tables via Supabase API...\n');

  // Vérifier les tables existantes
  console.log('📋 Vérification des tables existantes:\n');
  
  for (const table of TABLES) {
    const exists = await checkTable(table.name);
    console.log(`   ${exists ? '✅' : '❌'} ${table.name}`);
  }

  console.log('\n✨ Les tables manquantes doivent être créées dans SQL Editor');
  console.log('📍 https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
}

main();



