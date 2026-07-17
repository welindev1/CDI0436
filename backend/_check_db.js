const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_U0EyYCW3MNIr@ep-mute-moon-ain832q1-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'
});
(async () => {
  try {
    await client.connect();
    const res = await client.query('SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = $1 ORDER BY table_name, ordinal_position', ['public']);
    console.log('=== FK columns in database ===');
    for (const row of res.rows) {
      console.log(row.table_name + ' => ' + row.column_name + ' (' + row.data_type + ')');
    }
    await client.end();
  } catch (e) {
    console.error('ERROR:', e.message);
  }
})();
