const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_U0EyYCW3MNIr@ep-mute-moon-ain832q1-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function run() {
  await client.connect();
  console.log('Connected to DB');
  
  const res = await client.query(`
    SELECT id, fecha, estado, "claseId", "beneficiarioId" 
    FROM asistencias 
    WHERE estado = 'ausente' 
    ORDER BY fecha DESC
    LIMIT 10
  `);
  console.log('Ausencias:', res.rows);
  
  const res2 = await client.query(`
    SELECT count(*) FROM asistencias WHERE estado = 'ausente'
  `);
  console.log('Total ausencias:', res2.rows[0]);
  
  await client.end();
}

run().catch(console.error);
