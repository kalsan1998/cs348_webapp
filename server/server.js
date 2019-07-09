var db = require('./database.js');
var express = require('express');
var app = express();

// Serves all the files in the html folder.
app.use(express.static('./html'));

// On initial load it will load this HTML file.
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/webapp.html');
});

// The venues.html file makes a GET request when it loads.
// This will call the following code, which queries the database.
app.get('/venues_db', async (req, res) => {
    try {
        const data = await db.getVenues(req.query);
        res.send(data);
    } catch (e) {
        console.log(e);
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000/'));
