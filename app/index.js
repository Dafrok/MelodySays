/**
 * @file UI controller
 * @author Dafrok
 */

const {ipcRenderer} = require('electron');

const $list = document.getElementById('content');
const $close = document.getElementById('close');

$close.onclick = function () {
    ipcRenderer.send('close');
};

ipcRenderer.on('record', (event, message) => {
    const $item = document.createElement('li');
    $item.innerText = message;
    $list.appendChild($item);
    $list.scrollTo({
        top: $list.scrollHeight,
        behavior: 'smooth'
    });
});
