var db = require('./database.js');
var express = require('express');
var app = express();


app.use(express.static('./html'));
app.get('/', (req, res) => {
    res.sendfile(__dirname + '/html/webapp.html');
});
app.get('/venues_db', async (req, res) => {
    try {
        const data = await db.getVenues();
        res.send(data);
    } catch (e) {
        console.log(e);
    }
});
app.listen(3000, () => console.log('Listening on http://localhost:3000/'));
