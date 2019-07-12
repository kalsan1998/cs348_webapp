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

// Export the functions for use by server.js
exports.getVenues = getVenues;
exports.insertVenue = insertVenue;
exports.updateVenue = updateVenue;
exports.deleteVenue = deleteVenue;


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
	var query = "SELECT * FROM venue";
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}
	query += " ORDER BY venue_name;";
    const client = await pool.connect();
    const res = await client.query(query, vals);
    await client.release();
    return res.rows;
}

async function insertVenue(params) {
	var query = `INSERT INTO venue(venue_name, description, 
		max_capacity, venue_address, cost_per_hour) 
		VALUES($1,$2,$3,$4,$5);`;
	const vals = [params.name, params.description, params.capacity, params.address, params.price];
	const client = await pool.connect();
	await client.query(query, vals);
    await client.release();
}

async function updateVenue(params) {
	// Returns the updated row.
	var query = `
		UPDATE venue SET
			venue_name=$2,
			venue_address=$3,
			max_capacity=$4,
			cost_per_hour=$5,
			description=$6
		WHERE venue_id=$1
		RETURNING *;
	`;
	const vals = [params.id, params.name, params.address, params.capacity, params.price, params.description];
	const client = await pool.connect();
	const row = await client.query(query, vals);
	await client.release();
	return row;
}

async function deleteVenue(id) {
	var query = `DELETE FROM venue WHERE venue_id=$1;`;
	const client = await pool.connect();
	await client.query(query, [id]);
    await client.release();
}
