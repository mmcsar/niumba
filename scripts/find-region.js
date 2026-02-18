const { Client } = require('pg');

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.PGPASSWORD;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
if (!DB_PASSWORD || !PROJECT_REF) {
  console.error('Définir SUPABASE_DB_PASSWORD et SUPABASE_PROJECT_REF dans .env');
  process.exit(1);
}

const regions = [
  'us-east-1',
  'us-west-1', 
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'sa-east-1'
];

async function tryRegion(region) {
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 6543, // Pooler port
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    await client.end();
    return true;
  } catch (e) {
    return false;
  }
}

async function findRegion() {
  console.log('🔍 Recherche de la région Supabase...\n');
  
  for (const region of regions) {
    process.stdout.write(`   Testing ${region}... `);
    const ok = await tryRegion(region);
    if (ok) {
      console.log('✅ TROUVÉ!');
      return region;
    } else {
      console.log('❌');
    }
  }
  return null;
}

findRegion().then(region => {
  if (region) {
    console.log(`\n🎯 Votre région: ${region}`);
  } else {
    console.log('\n❌ Aucune région trouvée');
  }
});



