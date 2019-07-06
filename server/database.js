const pg = require('pg');

// Find connection info by typing /conninfo from psql
// Default port is usually 5432
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cs348',
    password: 'password',
    port: '5433',
});

// Export the function for use by server.js
exports.getVenues = getVenues;

async function getVenues() {
    const client = await pool.connect();
    const data = [];
    const res = await client.query("SELECT venue_name, venue_address FROM venue;");
    res.rows.forEach(row => {
        data.push(
            {
                'name' : row['venue_name'],
                'address' : row['venue_address']
            }
        );
    });
    await client.release();
    console.log(data);
    return data;
}
