require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const AV = require('leanengine');
const cors = require('cors');

AV.init({
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

AV.Cloud.useMasterKey();

const app = express();
const port = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000);

const http = require('http').createServer(app);
// const io = require('socket.io')(http);

const publicPath = path.resolve(__dirname, '../client');

app.enable('trust proxy');
app.set('public', publicPath);
app.use(AV.express());
app.use(express.static(publicPath));
app.use(bodyParser.text());

app.post('/api/killmylove', cors({
    origin: 'https://sweet.dafrok.top',
    optionsSuccessStatus: 200
}), (req, res) => {
    if (req.body === 'kill my love') {
        res.send('killed');
    }
    res.end();
})

// io.on('connection', socket => {
//     console.log('a user connected');
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });
//     socket.on('record', msg => {
//         console.log('record!', msg);
//         socket.broadcast.emit('output', msg);
//     });
// });

http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
