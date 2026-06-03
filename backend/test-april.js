const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_U0EyYCW3MNIr@ep-mute-moon-ain832q1-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function run() {
  await client.connect();

  // Check April 2026
  const res = await client.query(`
    SELECT id, fecha, estado 
    FROM asistencias 
    WHERE estado = 'ausente' AND fecha >= '2026-04-01' AND fecha <= '2026-04-30'
    LIMIT 5
  `);
  console.log('Ausencias April 2026:', res.rows.length, res.rows);

  // Check distinct months in DB
  const res2 = await client.query(`
    SELECT DATE_TRUNC('month', fecha) as mes, count(*) 
    FROM asistencias 
    WHERE estado = 'ausente'
    GROUP BY mes
    ORDER BY mes DESC
    LIMIT 10
  `);
  console.log('Months with ausencias:', res2.rows);

  await client.end();
}

run().catch(console.error);
