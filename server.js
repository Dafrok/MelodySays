const express = require('express');
const bodyParser = require('body-parser');
const mainApp = require('./main.js');

const app = express();
const port = 3080;

app.use(bodyParser.text())
app.use(express.static('public'))

app.post('/record', (req, res) => {
  const win = mainApp.getWindow();
  win.webContents.send('record', req.body)
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});