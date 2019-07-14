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

exports.getEntertainment = getEntertainment;
exports.insertEntertainment = insertEntertainment;
exports.updateEntertainment = updateEntertainment;
exports.deleteEntertainment = deleteEntertainment;

exports.getClients = getClients;
exports.updateClient = updateClient;
exports.addClient = addClient;
exports.deleteClient = deleteClient;
exports.getClientEvent = getClientEvent;

exports.getClientBilling = getClientBilling;
exports.deleteBillingInfo = deleteBillingInfo;
exports.addBillingInfo = addBillingInfo;

exports.deleteEvent = deleteEvent;


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
			price_per_quantity=$4
		WHERE supplier_id=$1 AND supply_name=$2;
	`;
	const vals = [params.supplier_id, params.supply_name, params.description, 
		params.price_per_quantity];
	const client = await pool.connect();
	await client.query(query, vals);
	await client.release();
}

async function getMenu(params) {
	var clauses = [];
	var vals = [];
	if (params.name) {
		clauses.push("food_item.supply_name ILIKE $" + (vals.length  + 1 ));
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
	if(params.servings) {
		clauses.push("servings_per_quantity >= $" + (vals.length + 1));
		vals.push(params.servings);
	}
	var query = "SELECT * FROM (food_item INNER JOIN supply ON food_item.supplier_id \
		= supply.supplier_id) INNER JOIN supplier ON food_item.supplier_id = supplier.supplier_id \
		AND food_item.supply_name = supply.supply_name";
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}
	query += " ORDER BY supply.supply_name;";
	const client = await pool.connect();
    const res = await client.query(query, vals);
    await client.release();
    return res.rows;
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
	var res_query = "SELECT * FROM (food_item INNER JOIN supply ON food_item.supplier_id \
		= supply.supplier_id AND food_item.supply_name = supply.supply_name) INNER JOIN \
		supplier ON food_item.supplier_id = supplier.supplier_id WHERE \
		supply.supplier_id=$1 AND supply.supply_name=$2";
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

async function getClients(params) {
	var clauses = [];
	var vals = [];

	// WHERE clause builder
	if (params.first_name) {
		clauses.push("app_user.first_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.first_name + '%');
	}
	if (params.last_name) {
		clauses.push("app_user.last_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.last_name + '%');
	}
	if (params.email) {
		clauses.push("app_user.email ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.email + '%');
	}

	// SELECT clause
	query = "SELECT app_user.first_name as first_name, app_user.last_name as last_name, \
		app_user.email as email, home_address, phone_number, \
		COALESCE(SUM(event.total_cost), 0) as total_paid, \
		COUNT(billed_to) as number_booked_events \
		FROM ((app_user INNER JOIN client ON app_user.email = client.email) LEFT OUTER JOIN \
		billing_information ON billing_information.client_email = app_user.email) LEFT OUTER JOIN \
		event ON billing_information.billing_id = event.billed_to";
	
	// WHERE clause
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}

	// GROUP BY clause
	query += " GROUP BY app_user.email, app_user.last_name, app_user.email, home_address, \
		phone_number";
	
	// HAVING clauses
	if (params.min_paid || params.min_events) {
		query += " HAVING true";
	}
	if (params.min_paid) {
		query += " AND COALESCE(SUM(event.total_cost), 0) >= $" + (vals.length + 1);
		vals.push(params.min_paid);
	}
	if (params.min_events) {
		query += " AND COUNT(billed_to) >= $" + (vals.length + 1);
		vals.push(params.min_events);
	}

	// ORDER BY clause
	query += " ORDER BY app_user.first_name;";

    const client = await pool.connect();
	const res = await client.query(query, vals);
	await client.release();
    return res.rows;
}

async function updateClient(params) {
	var query = `
		UPDATE client SET
			home_address=$2,
			phone_number=$3
		WHERE email=$1
		RETURNING *;
	`;
	const vals = [params.email, params.home_address, params.phone_number];
	const client = await pool.connect();
	const row = await client.query(query, vals);
	await client.release();
	return row;
}

async function addClient(params) {
	var query1 = "INSERT INTO app_user(email, password, first_name, last_name) \
		VALUES($1, $2, $3, $4);";
	var query2 = "INSERT INTO client(email, home_address, phone_number) \
		VALUES($1, $2, $3);";
	var vals1 = [params.email, "password", params.first_name, params.last_name];
	var vals2 = [params.email, params.home_address, params.phone_number];
	const client = await pool.connect();
	await client.query(query1, vals1);
	await client.query(query2, vals2);
    await client.release();
}

async function deleteClient(params) {
	var query1 = 
		`DELETE FROM client WHERE email=$1;`;
	var query2 = 
		`DELETE FROM app_user WHERE email=$1;`;
	const client = await pool.connect();
	await client.query(query1, [params.email]);
	await client.query(query2, [params.email]);
    await client.release();
}

async function getClientBilling(params) {
	var query = "SELECT billing_id, card_number, cardholder_name, billing_address, \
		to_char(date_added, 'dd-mm-yyyy') as date_added, COUNT(billed_to) as events_booked, \
		COALESCE(SUM(total_cost), 0) as amount_paid \
		FROM billing_information LEFT OUTER JOIN event ON \
		billing_information.billing_id = event.billed_to \
		WHERE client_email = $1 \
		GROUP BY billing_id, card_number, cardholder_name, billing_address \
		ORDER BY date_added;";
	var vals = [params.email];
    const client = await pool.connect();
    const res = await client.query(query, vals);
    await client.release();
    return res.rows;
}

async function deleteBillingInfo(params) {
	var query = "DELETE FROM billing_information \
		WHERE billing_id=$1;";
	var vals = [params.billing_id];
	const client = await pool.connect();
	await client.query(query, vals);
    await client.release();
}

async function addBillingInfo(params) {
	var query = "INSERT INTO billing_information(card_number, expiration_date, \
		cardholder_name, cvv, billing_address, client_email, date_added) \
		VALUES($1, $2, $3, $4, $5, $6, current_timestamp);";
	var vals = [params.card_number, params.expiration_date, params.cardholder_name,
		params.cvv, params.billing_address, params.client_email];
	const client = await pool.connect();
	await client.query(query, vals);
	await client.release();
}

async function getClientEvent(params) {
	var query = "SELECT * FROM (event INNER JOIN venue ON event.venue_id = \
		venue.venue_id) INNER JOIN billing_information ON \
		event.billed_to = billing_information.billing_id WHERE \
		billing_information.client_email = $1;";
	var vals = [params.email];
	const client = await pool.connect();
	const res = await client.query(query, vals);
	await client.release();
	return res.rows;
}

// id[0] = billed_to, id[1] = venue_id, id[2] = event_datetime
async function deleteEvent(id) {
	var query = "DELETE FROM event \
		WHERE billed_to=$1 AND venue_id=$2 AND event_datetime=$3;";
	var vals = [id[0], id[1], id[2]];
	const client = await pool.connect();
	await client.query(query, vals);
    await client.release();
}

async function getEntertainment(params) {
	var clauses = [];
	var vals = [];
	if (params.name) {
		clauses.push("entertainment.supply_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.name + '%');
	}
	if (params.min_duration) {
		clauses.push("duration  >= $" + (vals.length  + 1 ));
		vals.push(params.min_duration);
	}
	if(params.max_duration) {
		clauses.push("duration <= $" + (vals.length + 1));
		vals.push(params.max_duration);
	}
	if(params.price) {
		clauses.push("price_per_quantity <= $" + (vals.length + 1));
		vals.push(params.price);
	}
	var query = "SELECT * FROM (entertainment INNER JOIN supply ON entertainment.supplier_id \
		= supply.supplier_id) INNER JOIN supplier ON entertainment.supplier_id = supplier.supplier_id \
		AND entertainment.supply_name = supply.supply_name";
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}
	query += " ORDER BY supply.supply_name;";
	const client = await pool.connect();
    const res = await client.query(query, vals);
    await client.release();
    return res.rows;
}

async function insertEntertainment(params) {
	await insertSupply(params);
	var query = `INSERT INTO entertainment(supplier_id, supply_name, duration)
		VALUES($1,$2,$3);`;
	const vals = [params.supplier_id, params.supply_name, params.duration];
	const client = await pool.connect();
	await client.query(query, vals);
    await client.release();
}

async function updateEntertainment(params) {
	await updateSupply(params);
	var query = `
		UPDATE entertainment SET
			duration=$3
		WHERE supplier_id=$1 AND supply_name=$2;
	`;
	const vals = [params.supplier_id, params.supply_name, params.duration];

	const client = await pool.connect();
	await client.query(query, vals);
	
	// Return query.
	var res_query = "SELECT * FROM (entertainment INNER JOIN supply ON entertainment.supplier_id \
		= supply.supplier_id AND entertainment.supply_name = supply.supply_name) INNER JOIN \
		supplier ON entertainment.supplier_id = supplier.supplier_id WHERE \
		supply.supplier_id=$1 AND supply.supply_name=$2";
	const res_vals = [params.supplier_id, params.supply_name];

	const row = await client.query(res_query, res_vals);
	await client.release();
	return row;
}

async function deleteEntertainment(id) {
	var query1 = 
		`DELETE FROM entertainment WHERE supplier_id=$1 AND supply_name=$2;`;
	var query2 = 
		`DELETE FROM supply WHERE supplier_id=$1 AND supply_name=$2;`;
	const client = await pool.connect();
	await client.query(query1, id);
	await client.query(query2, id);
    await client.release();
}