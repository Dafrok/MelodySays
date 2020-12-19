const express = require('express');
const bodyParser = require('body-parser');
const mainApp = require('./main.js');
const path = require('path');

const app = express();
const port = 3080;

const publicPath = path.resolve(__dirname, './public');

app.set('public', __dirname + '/public');

app.use(bodyParser.text());

app.use(express.static(publicPath));

app.post('/record', (req, res) => {
    const win = mainApp.getWindow();
    win.webContents.send('record', req.body);
    res.end();
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
