const pool = require('./db');

async function checkEstados() {
    try {
        const result = await pool.query('SELECT DISTINCT estado FROM compromisos');
        console.log('Estados:', result.rows.map(row => row.estado));
    } catch (err) {
        console.error('Error checking estados:', err);
    } finally {
        pool.end();
    }
}

checkEstados();
