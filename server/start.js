const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const publicPath = path.resolve(__dirname, '../client');

app.set('public', publicPath);
app.use(express.static(publicPath));
app.use(bodyParser.text());

io.on('connection', socket => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('record', msg => {
        console.log('record!', msg);
        socket.broadcast.emit('output', msg);
    });
});

http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
