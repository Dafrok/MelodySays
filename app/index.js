/**
 * @file UI controller
 * @author Dafrok
 */

const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ip = require('ip');

const $list = document.getElementById('content');
const $close = document.getElementById('close');
const $getIp = document.getElementById('get-ip');

$close.onclick = function () {
    ipcRenderer.send('close');
};

$getIp.onclick = function () {
    alert(JSON.stringify(ip.address()));
};

ipcRenderer.on('record', (event, message) => {
    const $item = document.createElement('p');
    $item.innerText = message;
    $list.appendChild($item);
    $list.scrollTo({
        top: $list.scrollHeight,
        behavior: 'smooth'
    });
});

(async () => {
    const watcher = fs.watch(path.resolve(__dirname));
    watcher.on('change', () => {
        ipcRenderer.send('re-render');
    });
})();
