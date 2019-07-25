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
exports.getSuppliers = getSuppliers;
exports.getSupplierSupplies = getSupplierSupplies;
exports.updateSupplier = updateSupplier;
exports.addSupplier = addSupplier;
exports.deleteSupplier = deleteSupplier;

exports.getVenues = getVenues;
exports.insertVenue = insertVenue;
exports.updateVenue = updateVenue;
exports.deleteVenue = deleteVenue;
exports.getVenueOptions = getVenueOptions;

exports.getMenu = getMenu;
exports.insertMenu = insertMenu;
exports.updateMenu = updateMenu;
exports.deleteMenu = deleteMenu;

exports.getEntertainment = getEntertainment;
exports.insertEntertainment = insertEntertainment;
exports.updateEntertainment = updateEntertainment;
exports.deleteEntertainment = deleteEntertainment;

exports.getDecorations = getDecorations;
exports.insertDecorations = insertDecorations;
exports.updateDecorations = updateDecorations;
exports.deleteDecorations = deleteDecorations;

exports.getClients = getClients;
exports.updateClient = updateClient;
exports.addClient = addClient;
exports.deleteClient = deleteClient;

exports.getClientBilling = getClientBilling;
exports.deleteBillingInfo = deleteBillingInfo;
exports.addBillingInfo = addBillingInfo;

exports.getEvent = getEvent;
exports.addEvent = addEvent;
exports.getEventSupplyOrder = getEventSupplyOrder;
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
	const res = await client.query(query, vals);
	await client.release();
	return res.rows;
}

async function deleteVenue(id) {
	var query = `DELETE FROM venue WHERE venue_id=$1;`;
	const client = await pool.connect();
	await client.query(query, [id]);
    await client.release();
}

async function getVenueOptions(params) {
	const query = `
		SELECT venue_id, venue_name, cost_per_hour
		FROM venue 
		WHERE venue_id NOT IN (
			SELECT venue_id
			FROM event
			WHERE event_datetime::date >= $1::date
            AND event_datetime::date < ($1::date + '1 day'::interval)
		)
		AND max_capacity >= $2;
	`;
	const client = await pool.connect();
	const res = await client.query(query, [params.date, params.attendees]);
	await client.release();
	return res.rows;
}

// Returns the comapny_name of all supplier.
async function getSupplierNames(params) {
	const client = await pool.connect();
	const res = await client.query("SELECT supplier_id, \
		company_name FROM supplier ORDER BY company_name;");
	await client.release();
	return res.rows;
}

async function getSuppliers(params) {
	var clauses = [];
	var vals = [];

	// WHERE clause builder
	if (params.company_name) {
		clauses.push("s.company_name ILIKE $1");
		vals.push('%' + params.company_name + '%');
	}

	if (params.supplier_id) {
		clauses.push("s.supplier_id=$" + vals.length + 1);
		vals.push(params.supplier_id);
	}

	// SELECT clause
	query = `SELECT s.*, COALESCE(sc.supply_count, 0) supply_count 
			FROM supplier s
			LEFT JOIN (
				SELECT supplier_id, COUNT(*) AS supply_count
				FROM supply
				GROUP BY supplier_id
			) sc USING(supplier_id)`;
	
	// WHERE clause
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}

	// ORDER BY clause
	query += " ORDER BY s.company_name;";

    const client = await pool.connect();
	const res = await client.query(query, vals);
	await client.release();
    return res.rows;
}

async function getSupplierSupplies(params) {
	const query = `
		SELECT s.supply_name, si.supply_type, s.description, s.price_per_quantity
		FROM supply s JOIN (
			SELECT supplier_id, supply_name, 'Menu Item' AS supply_type
			FROM food_item
			UNION
			SELECT supplier_id, supply_name, 'Decoration' AS supply_type
			FROM decoration
			UNION
			SELECT supplier_id, supply_name, 'Entertainment' AS supply_type
			FROM entertainment
		) si USING(supplier_id, supply_name)
		WHERE supplier_id=$1
		ORDER BY si.supply_type, s.supply_name;
	`;

	const client = await pool.connect();
	const res = await client.query(query, [params.supplier_id]);
	await client.release();
    return res.rows;
} 

async function updateSupplier(params) {
	var query = `
		UPDATE supplier SET
			company_address=$2,
			company_phone=$3,
			company_email=$4			
		WHERE supplier_id=$1
		RETURNING *;
	`;
	const vals = [params.supplier_id, params.company_address, params.company_phone, params.company_email];
	const client = await pool.connect();
	const res = await client.query(query, vals);
	await client.release();
	return res.rows;
}

async function addSupplier(params) {
	var query = "INSERT INTO supplier(company_name, company_email, company_address, company_phone) \
		VALUES($1, $2, $3, $4);";
	var vals = [params.company_name, params.company_email, params.company_address, params.company_phone];
	const client = await pool.connect();
	await client.query(query, vals);
    await client.release();
}

async function deleteSupplier(params) {
	var query = 
		`DELETE FROM supplier WHERE supplier_id=$1;`;
	const client = await pool.connect();
	await client.query(query, [params.supplier_id]);
    await client.release();
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
	if (params.supplier_name) {
		clauses.push("supplier.company_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.supplier_name + '%');
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

	const res = await client.query(res_query, res_vals);
	await client.release();
	return res.rows;
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
	const res = await client.query(query, vals);
	await client.release();
	return res.rows;
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
		to_char(date_added, 'dd MONTH yyyy') as date_added, COUNT(billed_to) as events_booked, \
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

async function addEvent(params, supply_order) {
	const insert_event = `
		INSERT INTO event(billed_to, venue_id, event_datetime, event_duration,
			attendees, manager, total_cost, booking_date)
		VALUES($1, $2, $3, $4, $5, $6, $7, NOW());
	`;
	const insert_supply_order = `
		INSERT INTO supply_order(billed_to, venue_id, event_datetime, supplier_id,
			supply_name, supply_quantity, supply_cost)
		VALUES($1, $2, $3, $4, $5, $6, $7);
	`;
	const event_vals = [
		params.billed_to, 
		params.venue_id,
		params.event_datetime,
		params.event_duration,
		params.attendees,
		params.manager,
		params.total_cost
	];
	const client = await pool.connect();
	try {
		await client.query('BEGIN'); // Start transaction.
		await client.query(insert_event, event_vals);
		for (const order of supply_order) {
			const order_vals = [
				params.billed_to, 
				params.venue_id,
				params.event_datetime,
				order.supplier_id,
				order.supply_name,
				order.supply_quantity,
				order.supply_cost,
			];
			await client.query(insert_supply_order, order_vals);
		}
		await client.query('COMMIT');
	} catch(e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		await client.release();
	}
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
	if (params.supplier_name) {
		clauses.push("supplier.company_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.supplier_name + '%');
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

	const res = await client.query(res_query, res_vals);
	await client.release();
	return res.rows;
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

async function getDecorations(params) {
	var clauses = [];
	var vals = [];
	if (params.name) {
		clauses.push("decoration.supply_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.name + '%');
	}
	if (params.type) {
		clauses.push("type  ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.type + '%');
	}
	if(params.price) {
		clauses.push("price_per_quantity <= $" + (vals.length + 1));
		vals.push(params.price);
	}
	if (params.supplier_name) {
		clauses.push("supplier.company_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.supplier_name + '%');
	}
	var query = "SELECT * FROM (decoration INNER JOIN supply ON decoration.supplier_id \
		= supply.supplier_id) INNER JOIN supplier ON decoration.supplier_id = supplier.supplier_id \
		AND decoration.supply_name = supply.supply_name";
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}
	query += " ORDER BY supply.supply_name;";
	const client = await pool.connect();
    const res = await client.query(query, vals);
    await client.release();
    return res.rows;
}

async function insertDecorations(params) {
	await insertSupply(params);
	var query = `INSERT INTO decoration(supplier_id, supply_name, type)
		VALUES($1,$2,$3);`;
	const vals = [params.supplier_id, params.supply_name, params.type];
	const client = await pool.connect();
	await client.query(query, vals);
    await client.release();
}

async function updateDecorations(params) {
	await updateSupply(params);
	var query = `
		UPDATE decoration SET
			type=$3
		WHERE supplier_id=$1 AND supply_name=$2;
	`;
	const vals = [params.supplier_id, params.supply_name, params.type];

	const client = await pool.connect();
	await client.query(query, vals);
	
	// Return query.
	var res_query = "SELECT * FROM (decoration INNER JOIN supply ON decoration.supplier_id \
		= supply.supplier_id AND decoration.supply_name = supply.supply_name) INNER JOIN \
		supplier ON decoration.supplier_id = supplier.supplier_id WHERE \
		supply.supplier_id=$1 AND supply.supply_name=$2";
	const res_vals = [params.supplier_id, params.supply_name];

	const res = await client.query(res_query, res_vals);
	await client.release();
	return res.rows;
}

async function deleteDecorations(id) {
	var query1 = 
		`DELETE FROM decoration WHERE supplier_id=$1 AND supply_name=$2;`;
	var query2 = 
		`DELETE FROM supply WHERE supplier_id=$1 AND supply_name=$2;`;
	const client = await pool.connect();
	await client.query(query1, id);
	await client.query(query2, id);
    await client.release();
}
					
async function getEvent(params) {
	var clauses = [];
	var vals = [];
	if (params.venue_name) {
		clauses.push("venue.venue_name ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.venue_name + '%');
	}
	if (params.min_attendees) {
		clauses.push("event.attendees  >= $" + (vals.length  + 1 ));
		vals.push(params.min_attendees);
	}
	if(params.min_cost) {
		clauses.push("event.total_cost >= $" + (vals.length + 1));
		vals.push(params.min_cost);
	}
	if(params.min_duration) {
		clauses.push("event.event_duration >= $" + (vals.length + 1));
		vals.push(params.min_duration);
	}
	if (params.manager_name) {
		clauses.push("CONCAT(em.first_name, ' ', em.last_name) ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.manager_name + '%');
	}
	if (params.client_name) {
		clauses.push("CONCAT(cli.first_name, ' ', cli.last_name) ILIKE $" + (vals.length  + 1 ));
		vals.push('%' + params.client_name + '%');
	}
	if(params.date_after) {
		clauses.push("event.event_datetime >= $" + (vals.length + 1));
		vals.push(params.date_after);
	}
	if(params.date_before) {
		clauses.push("event.event_datetime <= $" + (vals.length + 1));
		vals.push(params.date_before);
	}
	if (params.client_email) {
		clauses.push("cli.email ILIKE $" + (vals.length  + 1));
		vals.push('%' + params.client_email + '%');
	}
	if(params.billed_to) {
		clauses.push("event.billed_to = $" + (vals.length + 1));
		vals.push(params.billed_to);
	}
	if(params.venue_id) {
		clauses.push("event.venue_id = $" + (vals.length + 1));
		vals.push(params.venue_id);
	}
	// if(params.event_datetime) {
	// 	clauses.push("event.event_datetime = $" + (vals.length + 1));
	// 	vals.push(params.event_datetime);
	// }
	var query = "WITH em AS ( \
					SELECT app_user.email, app_user.first_name, app_user.last_name \
					FROM app_user INNER JOIN employee ON app_user.email = employee.email), \
					  cli AS ( \
					SELECT app_user.email, app_user.first_name, app_user.last_name \
					FROM app_user INNER JOIN client ON app_user.email = client.email) \
		SELECT venue.venue_name, venue.venue_address, event.billed_to, event.venue_id, \
			to_char(event.event_datetime, 'YYYY-MM-DD HH:MI:SS') AS event_datetime_id, \
			to_char(event.event_datetime, 'dd MONTH yyyy HH24:MI:SS') AS event_datetime, \
			event.event_duration, event.attendees, CONCAT(em.first_name, ' ', em.last_name) AS manager, \
			event.total_cost, to_char(event.booking_date, 'dd MONTH yyyy') AS booking_date, \
			CONCAT(cli.first_name, ' ', cli.last_name) AS client_name, \
			cli.email AS client_email \
		FROM (((event INNER JOIN venue ON venue.venue_id = event.venue_id) \
		INNER JOIN billing_information \
			ON event.billed_to = billing_information.billing_id) \
		INNER JOIN cli \
			ON billing_information.client_email = cli.email) \
		INNER JOIN em \
			ON event.manager = em.email";
	if (clauses.length > 0) {
		query += " WHERE " + clauses.join(" AND ");
	}
	query += " ORDER BY event.booking_date;";
	const client = await pool.connect();
    const res = await client.query(query, vals);
    await client.release();
    return res.rows;
}

async function getEventSupplyOrder(params) {
	var query = "SELECT supply.supply_name, supply_order.supply_quantity, supply_order.supply_cost, \
	supply.description, supplier.company_name \
	FROM ((supply_order INNER JOIN event ON \
	supply_order.billed_to = event.billed_to \
	AND supply_order.venue_id = event.venue_id \
	AND supply_order.event_datetime = event.event_datetime) INNER JOIN supply ON \
	supply.supplier_id = supply_order.supplier_id \
	AND supply.supply_name = supply_order.supply_name) INNER JOIN supplier ON \
	supplier.supplier_id = supply.supplier_id \
	WHERE supply_order.billed_to = $1 AND supply_order.venue_id = $2 AND supply_order.event_datetime = $3;";
	var vals = [params.billed_to, params.venue_id, params.event_datetime];
	const client = await pool.connect();
	const res = await client.query(query, vals);
	await client.release();
	return res.rows;
}
