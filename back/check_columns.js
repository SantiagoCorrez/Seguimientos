const pool = require('./db');

async function checkColumns() {
    try {
        const result = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'compromisos';
        `);
        console.log('Columns in compromisos table:', result.rows.map(row => row.column_name));
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        pool.end();
    }
}

checkColumns();
