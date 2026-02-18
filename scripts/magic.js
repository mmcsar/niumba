const { Client } = require('pg');

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.PGPASSWORD;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
if (!DB_PASSWORD || !PROJECT_REF) {
  console.error('Définir SUPABASE_DB_PASSWORD et SUPABASE_PROJECT_REF dans .env');
  process.exit(1);
}

const SQL = `
CREATE TABLE IF NOT EXISTS profiles (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, email TEXT, full_name TEXT, phone TEXT, avatar_url TEXT, role TEXT DEFAULT 'user', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS properties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, price NUMERIC NOT NULL, currency TEXT DEFAULT 'XOF', property_type TEXT, transaction_type TEXT, bedrooms INTEGER, bathrooms INTEGER, area NUMERIC, address TEXT, city TEXT, status TEXT DEFAULT 'active', images TEXT[], created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS saved_properties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, property_id UUID REFERENCES properties(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS inquiries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE, property_id UUID REFERENCES properties(id) ON DELETE CASCADE, message TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS appointments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE, property_id UUID REFERENCES properties(id) ON DELETE CASCADE, scheduled_date DATE NOT NULL, scheduled_time TIME NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, property_id UUID REFERENCES properties(id) ON DELETE CASCADE, rating INTEGER, comment TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS conversations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE, participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE, property_id UUID REFERENCES properties(id), last_message_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE, sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE, content TEXT NOT NULL, read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT, data JSONB, read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS search_alerts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, name TEXT, filters JSONB NOT NULL, active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW());
`;

const regions = ['us-east-1','us-west-1','eu-west-1','eu-west-2','eu-central-1','ap-southeast-1','ap-southeast-2','ap-northeast-1','ap-south-1','sa-east-1'];

async function tryRegion(region, port) {
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: port,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000
  });

  try {
    await client.connect();
    console.log(`✅ Connecté à ${region}:${port}!`);
    console.log('📦 Création des tables...');
    await client.query(SQL);
    console.log('✅ Tables créées!');
    
    const r = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('profiles','properties','messages') ORDER BY tablename");
    console.log('📋 Tables:', r.rows.map(x=>x.tablename).join(', '));
    
    await client.end();
    return true;
  } catch (e) {
    if (!e.message.includes('Tenant') && !e.message.includes('timeout')) {
      console.log(`   ${region}:${port} - ${e.message.substring(0,50)}`);
    }
    try { await client.end(); } catch(x) {}
    return false;
  }
}

async function magic() {
  console.log('🪄 MAGIC MODE - Recherche et création automatique...\n');
  
  for (const port of [6543, 5432]) {
    for (const region of regions) {
      process.stdout.write(`\r🔍 ${region}:${port}...                    `);
      const ok = await tryRegion(region, port);
      if (ok) {
        console.log('\n\n🎉 SUCCÈS! Base de données configurée!');
        return;
      }
    }
  }
  
  console.log('\n\n❌ Impossible de se connecter automatiquement.');
  console.log('\n💡 Solution alternative: copiez le SQL dans Supabase Dashboard');
}

magic();



