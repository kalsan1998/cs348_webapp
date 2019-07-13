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
exports.getSupplierNames = getSupplierNames;
exports.getVenues = getVenues;
exports.insertVenue = insertVenue;
exports.updateVenue = updateVenue;
exports.deleteVenue = deleteVenue;
exports.getMenu = getMenu;
exports.insertMenu = insertMenu;
exports.updateMenu = updateMenu;
exports.deleteMenu = deleteMenu;


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

// Returns the comapny_name of all supplier.
async function getSupplierNames(params) {
	const client = await pool.connect();
	const res = await client.query("SELECT supplier_id, \
		company_name FROM supplier ORDER BY company_name;");
	await client.release();
	return res.rows;
}

async function getMenu(params) {
	var clauses = [];
	var vals = [];
	if (params.name) {
		clauses.push("supply_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.name + '%');
	}
	if (params.is_vegetarian && params.is_vegetarian === 'true') {
		clauses.push("is_vegetarian = $" + (vals.length  + 1 ));
		vals.push(params.is_vegetarian);
	}
	if (params.is_vegan && params.is_vegan === 'true') {
		clauses.push("is_vegan = $" + (vals.length  + 1 ));
		vals.push(params.is_vegan);
	}
	if (params.is_gluten_free && params.is_gluten_free === 'true') {
		clauses.push("is_gluten_free = $" + (vals.length  + 1 ));
		vals.push(params.is_gluten_free);
	}
	if (params.is_halal && params.is_halal === 'true') {
		clauses.push("is_halal = $" + (vals.length  + 1 ));
		vals.push(params.is_halal);
	}
	if (params.price) {
		clauses.push("price_per_quantity  <= $" + (vals.length  + 1 ));
		vals.push(params.price);
	}
	var query = "SELECT * FROM food_item INNER JOIN supply ON food_item.supplier_id \
		= supply.supplier_id AND food_item.supply_name = supply.supply_name";
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}
	query += " ORDER BY supply.supply_name;";
	const client = await pool.connect();
    const res = await client.query(query, vals);
    await client.release();
    return res.rows;
}

async function insertSupply(params) {
	var query = `INSERT INTO supply(supplier_id, supply_name, description,
		price_per_quantity, min_quantity, max_quantity)
		VALUES($1, $2, $3, $4, $5, $6);`;
	const vals = [params.supplier_id, params.supply_name, params.description, 
		params.price_per_quantity, params.min_quantity, params.max_quantity];
	const client = await pool.connect();
	await client.query(query, vals);
	await client.release();
}

async function updateSupply(params) {
	var query = `
		UPDATE supply SET
			description=$3,
			price_per_quantity=$4,
			min_quantity=$5,
			max_quantity=$6
		WHERE supplier_id=$1 AND supply_name=$2;
	`;
	const vals = [params.supplier_id, params.supply_name, params.description, 
		params.price_per_quantity, params.min_quantity, params.max_quantity];
	const client = await pool.connect();
	await client.query(query, vals);
	await client.release();
}

async function insertMenu(params) {
	await insertSupply(params);
	var query = `INSERT INTO food_item(supplier_id, supply_name, is_vegetarian,
		is_vegan, is_gluten_free, is_halal, servings_per_quantity) 
		VALUES($1,$2,$3,$4,$5,$6,$7);`;
	const vals = [params.supplier_id, params.supply_name, params.is_vegetarian, 
		params.is_vegan, params.is_gluten_free, params.is_halal, params.servings_per_quantity];
	const client = await pool.connect();
	await client.query(query, vals);
    await client.release();
}

async function updateMenu(params) {
	await updateSupply(params);
	var query = `
		UPDATE food_item SET
			is_vegetarian=$3,
			is_vegan=$4,
			is_gluten_free=$5,
			is_halal=$6,
			servings_per_quantity=$7
		WHERE supplier_id=$1 AND supply_name=$2;
	`;
	const vals = [params.supplier_id, params.supply_name, params.is_vegetarian, 
		params.is_vegan, params.is_gluten_free, params.is_halal, 
		params.servings_per_quantity];

	const client = await pool.connect();
	await client.query(query, vals);
	
	// Return query.
	var res_query = "SELECT * FROM food_item INNER JOIN supply ON food_item.supplier_id \
		= supply.supplier_id AND food_item.supply_name = supply.supply_name \
		WHERE supply.supplier_id=$1 AND supply.supply_name=$2";
	const res_vals = [params.supplier_id, params.supply_name];

	const row = await client.query(res_query, res_vals);
	await client.release();
	return row;
}

// |id| is a list of 2 elements: id[0] = supplier_id, id[1] = supply_name.
async function deleteMenu(id) {
	var query1 = 
		`DELETE FROM food_item WHERE supplier_id=$1 AND supply_name=$2;`;
	var query2 = 
		`DELETE FROM supply WHERE supplier_id=$1 AND supply_name=$2;`;
	const client = await pool.connect();
	await client.query(query1, id);
	await client.query(query2, id);
    await client.release();
}
