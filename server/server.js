var db = require('./database.js');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

// Serves all the files in the html folder.
app.use(express.static('./html'));
app.use(bodyParser());


// On initial load it will load this HTML file.
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/webapp.html');
});

// Venues related code.
app.get('/venues', async (req, res) => {
    try {
        const data = await db.getVenues(req.query);
        res.send(data);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/create_venue', async (req, res) => {
    try {
        await db.insertVenue(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/update_venue', async (req, res) => {
    try {
        const data = await db.updateVenue(req.body);
        res.send(data);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/delete_venue', async (req, res) => {
    try {
        await db.deleteVenue(req.body.id);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.get('/venue_options', async (req, res) => {
    try {
        const data = await db.getVenueOptions(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

// Supply related code.
// Returns a list of supplier name.
app.get('/supplier_name', async (req, res) => {
    try {
        const data = await db.getSupplierNames(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.get('/suppliers', async (req, res) => {
    try {
        const data = await db.getSuppliers(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.get('/supplier_supplies', async (req, res) => {
    try {
        const data = await db.getSupplierSupplies(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.post('/update_supplier', async (req, res) => {
    try {
        const data = await db.updateSupplier(req.body);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.post('/create_supplier', async (req, res) => {
    try {
        await db.addSupplier(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/delete_supplier', async (req, res) => {
    try {
        await db.deleteSupplier(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

// Food related code.
app.get('/menu', async (req, res) => {
    try {
        const data = await db.getMenu(req.query);
        res.send(data);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/create_menu', async (req, res) => {
    try {
        await db.insertMenu(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/update_menu', async (req, res) => {
    try {
        const data = await db.updateMenu(req.body);
        res.send(data);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/delete_menu', async (req, res) => {
    try {
        await db.deleteMenu([req.body.supplier_id, req.body.supply_name]);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

// Entertainment related functions.
app.get('/entertainment', async (req, res) => {
    try {
        const data = await db.getEntertainment(req.query);
        res.send(data);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/create_entertainment', async (req, res) => {
    try {
        await db.insertEntertainment(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/update_entertainment', async (req, res) => {
    try {
        const data = await db.updateEntertainment(req.body);
        res.send(data);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/delete_entertainment', async (req, res) => {
    try {
        await db.deleteEntertainment([req.body.supplier_id, req.body.supply_name]);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

// Decorations related functions.
app.get('/decorations', async (req, res) => {
    try {
        const data = await db.getDecorations(req.query);
        res.send(data);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/create_decorations', async (req, res) => {
    try {
        await db.insertDecorations(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/update_decorations', async (req, res) => {
    try {
        const data = await db.updateDecorations(req.body);
        res.send(data);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/delete_decorations', async (req, res) => {
    try {
        await db.deleteDecorations([req.body.supplier_id, req.body.supply_name]);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

// Client related functions.
app.get('/clients', async (req, res) => {
    try {
        const data = await db.getClients(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.post('/update_client', async (req, res) => {
    try {
        const data = await db.updateClient(req.body);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.post('/create_client', async (req, res) => {
    try {
        await db.addClient(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/delete_client', async (req, res) => {
    try {
        await db.deleteClient(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.get('/client_billing', async (req, res) => {
    try {
        const data = await db.getClientBilling(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.post('/delete_client_billing', async (req, res) => {
    try {
        await db.deleteBillingInfo(req.body);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/create_billing', async (req, res) => {
    try {
        await db.addBillingInfo(req.body);
        res.send(200);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.get('/event', async (req, res) => {
    try {
        const data = await db.getEvent(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.post('/book_event', async (req, res) => {
    try {
        await db.addEvent(req.body.event_params, req.body.supply_orders);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.post('/delete_event', async (req, res) => {
    try {
        await db.deleteEvent([req.body.billed_to, req.body.venue_id, req.body.event_datetime]);
        res.send(200);
    } catch (e) {
        // Probably should do better error handling.
        console.log(e);
        res.send(500);
    }
});

app.get('/event_supply_order', async (req, res) => {
    try {
        const data = await db.getEventSupplyOrder(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000/'));
