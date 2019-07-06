const pg = require('pg');
// Find connection info by typing /conninfo from psql
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cs348',
    password: 'password',
    port: '5433',
});

exports.getVenues = getVenues;

async function getVenues(params) {
	var clauses = [];
	var vals = [];
	if (params.name) {
		clauses.push("venue_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.name + '%');
	}
	if (params.capacity) {
		clauses.push("max_capacity >= $" + (vals.length  + 1 ));
		vals.push(params.capacity);
	}
	if (params.price) {
		clauses.push("cost_per_hour  <= $" + (vals.length  + 1 ));
		vals.push(params.price);
	}
	var query = "SELECT venue_name, venue_address, max_capacity, cost_per_hour FROM venue";
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}
	query += ";";
    const client = await pool.connect();
    const data = [];
    const res = await client.query(query, vals);
    await client.release();
    return res.rows;
}
