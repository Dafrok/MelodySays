/**
 * @file UI controller
 * @author Dafrok
 */

const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');
const myip = require('quick-local-ip');

var ni = require('os').networkInterfaces();
function getLocalIp() {
    var ipAddress = [];
    for (var key in ni) {
        for (var index in ni[key]) {
            if (ni[key][index].family === 'IPv4' && !ni[key][index].internal) {
                ipAddress.push(ni[key][index]);
            }
        }
    }
    if (ipAddress.length) {
        return ipAddress;
    }
    else {
        return ['127.0.0.1'];
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class App extends san.Component {
    static template = `
<div id="container">
    <div class="background"></div>
    <div id="name">{{name}}</div>
    <div id="name-shadow">{{name}}</div>
    <div id="content">
        <div id="content-inner" class="inner">
            <p s-for="paragraph in content">
                {{paragraph}}
            </p>
        </div>
    </div>
    <div class="menu">
        <a class="menu-btn" on-click="getIp"><i class="fa fa-wrench"></i></a>
        <a class="menu-btn" on-click="quit"><i class="fa fa-times"></i></a>
    </div>
    <div class="menu-shadow">
        <a class="menu-btn"><i class="fa fa-wrench"></i></a>
        <a class="menu-btn"><i class="fa fa-times"></i></a>
    </div>
</div>
    `;
    quit() {
        if (confirm('拜拜~')) {
            ipcRenderer.send('close');
        }
    }
    getIp() {
        this.data.set('ip', getLocalIp());
        // console.log(getLocalIp())
        // alert(getLocalIp() + ':3080');
    }
    changeName() {
        prompt('My Melody');
    }
    async startOutputTextQueue() {
        if (this.outputing) {
            return;
        }
        this.outputing = true;
        await this.outputText();
        this.outputing = false;
    }
    async outputText() {
        if (!this.textQueue.length) {
            return;
        }
        const content = this.data.get('content');
        const char = this.textQueue.shift();
        const line = content[content.length - 1] + char;
        this.data.set(`content[${content.length - 1}]`, line);
        if (/[。！？.!?]/.test(char)) {
            const content = this.data.get('content');
            if (content.length > 5) {
                content.shift();
            }
            content.push(['']);
            this.data.set('content', content.concat());
        }
        const $content = document.getElementById('content-inner');
        $content.scrollTo({
            top: $content.scrollHeight,
            behavior: 'smooth'
        });
        await sleep(1e2);
        return this.outputText();
    }
    attached() {
        this.getIp();
        this.textQueue = [];
        ipcRenderer.on('record', (e, message) => {
            this.textQueue.push(...message);
            this.startOutputTextQueue();
        });
    }
    initData() {
        return {
            content: [['']],
            ip: [],
            name: 'My Melody'
        };
    }
}

var app = new App();
app.attach(document.body);

(async () => {
    const watcher = fs.watch(path.resolve(__dirname));
    watcher.on('change', () => {
        ipcRenderer.send('re-render');
    });
})();
