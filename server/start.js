require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const AV = require('leanengine');
const cors = require('cors');
const { Octokit } = require("@octokit/core");

AV.init({
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

AV.Cloud.useMasterKey();

const octokit = new Octokit({ auth: process.env.KILL_MY_LOVE });

const response = await octokit.request("GET /orgs/{org}/repos", {
  org: "octokit",
  type: "private",
});
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
}), async (req, res) => {
    if (req.body === 'kill my love') {
        const resp = await octokit.request('PATCH /repos/Dafrok/melody-with-piano/issues/1', {body: 'ME'});
        if (resp.status === 200) {
            res.send('killed');
        }
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
