const { Client } = require('pg');
const dns = require('dns').promises;

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.PGPASSWORD;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
if (!DB_PASSWORD || !PROJECT_REF) {
  console.error('Définir SUPABASE_DB_PASSWORD et SUPABASE_PROJECT_REF dans .env');
  process.exit(1);
}

async function tryConnection(host, port, user) {
  const client = new Client({
    host: host,
    port: port,
    database: 'postgres',
    user: user,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    console.log(`Trying ${host}:${port} as ${user}...`);
    await client.connect();
    console.log('✅ Connected!');
    
    // Test query
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query OK!');
    
    await client.end();
    return true;
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Supabase connections...\n');

  // Try direct connection with IPv6
  console.log('=== Direct (IPv6) ===');
  await tryConnection(`db.${PROJECT_REF}.supabase.co`, 5432, 'postgres');

  // Try pooler with different ports
  console.log('\n=== Pooler Port 5432 ===');
  await tryConnection('aws-0-eu-west-1.pooler.supabase.com', 5432, `postgres.${PROJECT_REF}`);

  console.log('\n=== Pooler Port 6543 (Session) ===');
  await tryConnection('aws-0-eu-west-1.pooler.supabase.com', 6543, `postgres.${PROJECT_REF}`);

  // Try with just postgres user
  console.log('\n=== Direct postgres user ===');
  await tryConnection('aws-0-eu-west-1.pooler.supabase.com', 6543, 'postgres');
}

main();



