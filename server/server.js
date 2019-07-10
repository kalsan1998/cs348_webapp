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

// The venues.html file makes a GET request when it loads.
// This will call the following code, which queries the database.
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

app.listen(3000, () => console.log('Listening on http://localhost:3000/'));
