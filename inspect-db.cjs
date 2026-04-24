const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('--- Columns in products ---');
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));

    console.log('\n--- Constraints on products ---');
    const constraints = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'products'::regclass
    `);
    console.log(constraints.rows);

  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
run();
