const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_U0EyYCW3MNIr@ep-mute-moon-ain832q1-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function run() {
  await client.connect();
  
  const res = await client.query(`
    SELECT id, fecha, estado, "claseId", "beneficiarioId" 
    FROM asistencias 
    WHERE estado = 'ausente' AND fecha = '2026-06-03'
  `);
  console.log('Ausencias for today:', res.rows.length);
  
  await client.end();
}

run().catch(console.error);
