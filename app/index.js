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

class App extends san.Component {
    static template = `
<div id="container">
    <div class="background"></div>
    <div id="name">{{name}}</div>
    <div id="name-shadow">{{name}}</div>
    <div id="content">
        <div id="content-inner" class="inner">
            <p>测试</p>
            <p>测试</p>
            <p>测试</p>
            <p>测试</p>
            <p>测试</p>
            <p>测试</p>
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
    attached() {
        this.getIp();
        const $list = document.getElementById('content-inner');
        ipcRenderer.on('record', (event, message) => {
            console.log('#', message)
            const $item = document.createElement('p');
            $item.innerText = message;
            $list.appendChild($item);
            $list.scrollTo({
                top: $list.scrollHeight,
                behavior: 'smooth'
            });
        });
    }
    initData() {
        return {
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
