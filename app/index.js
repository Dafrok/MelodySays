/**
 * @file UI controller
 * @author Dafrok
 */

const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');
const clipIt = require('./clip-it');

var ni = require('os').networkInterfaces();
function getLocalIp() {
    var ipAddress = [];
    for (var key in ni) {
        for (var index in ni[key]) {
            if (ni[key][index].family === 'IPv4' && !ni[key][index].internal) {
                ipAddress.unshift(ni[key][index]);
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
    <div id="setting" s-if="showSetting">
        <form>
            <div class="field">
                <label>名字</label>
                <input value="{= name =}">
            </div>
            <div class="field">
                <label>本地IP</label>
                <div class="static">
                    <p>在下列地址中复制复制并发送到同一局域网下的手机中用浏览器打开（有效地址通常为 192.168.0 或 192.168.1 开头）</p>
                    <ul>
                        <li s-for="item in ip"><a on-click="copyText(item.address + ':3080')">{{item.address}}:3080 <i class="fa fa-copy"></i></a></li>
                    </ul>
                </div>
            </div>
        </form>
    </div>
    <div id="content" s-else>
        <div id="content-inner" class="inner">
            <p s-for="paragraph in content">
                {{paragraph}}
            </p>
        </div>
    </div>
    <div class="menu">
    <a class="menu-btn" on-click="toggleSetting"><i class="fa fa-wrench"></i></a>
    <a class="menu-btn" on-click="minimize"><i class="fa fa-minus"></i></a>
        <a class="menu-btn" on-click="quit"><i class="fa fa-times"></i></a>
    </div>
    <div class="menu-shadow">
        <a class="menu-btn"><i class="fa fa-wrench"></i></a>
        <a class="menu-btn"><i class="fa fa-times"></i></a>
    </div>
</div>
    `;
    copyText(str) {
        if (clipIt(str)) {
            alert(`"${str}" 复制成功`);
        }
        else {
            alert('复制失败');
        };
    }
    minimize() {
        ipcRenderer.send('minimize');
    }
    quit() {
        if (confirm('拜拜~')) {
            localStorage.setItem('username', this.data.get('name'));
            ipcRenderer.send('close');
        }
    }
    getIp() {
        this.data.set('ip', getLocalIp());
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
        const $content = document.getElementById('content-inner');
        if (/[。！？.!?]/.test(char)) {
            const content = this.data.get('content');
            if (content.length > 5) {
                content.shift();
            }
            content.push(['']);
            this.data.set('content', content.concat());
            // $content.scrollTop = $content.scrollTop - 24;
        }
        $content && requestAnimationFrame(() => $content.scrollTo({
            top: $content.scrollHeight - 1,
            behavior: 'smooth'
        }));
        await sleep(1e2);
        return this.outputText();
    }
    toggleSetting() {
        this.data.set('showSetting', !this.data.get('showSetting'));
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
        const name = localStorage.getItem('username');
        return {
            content: [['']],
            ip: [],
            name: name || 'My Melody',
            showSetting: false
        };
    }
}

const app = new App();
app.attach(document.body);

(async () => {
    const watcher = fs.watch(path.resolve(__dirname));
    watcher.on('change', () => {
        ipcRenderer.send('re-render');
    });
})();
