/**
 * @file UI controller
 * @author Dafrok
 */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class App extends san.Component {
    static template = `
<div id="container" class="{{noBorderMode ? 'no-border-mode' : ''}}">
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
                <label>无边框</label>
                <div class="form-control">
                    <input type="checkbox" checked="{= noBorderMode =}">
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
        <span class="rest"></span>
        <a class="menu-btn {{showWhiteBoard ? 'active' : ''}}" on-click="toggleWhiteBoard"><i class="fa fa-pencil"></i></a>
        <a class="menu-btn {{showSetting ? 'active' : ''}}" on-click="toggleSetting"><i class="fa fa-wrench"></i></a>
    </div>
    <div class="menu-shadow">
        <span class="rest"></span>
        <a class="menu-btn"><i class="fa fa-pencil"></i></a>
        <a class="menu-btn"><i class="fa fa-wrench"></i></a>
    </div>
    <div class="{{!outputing && content.length > 1 ? '' : 'hidden'}} next"></div>
    <div id="white-board" s-ref="white-board" s-if="showWhiteBoard" on-paste="onPaste" contenteditable="true">
    </div>
</div>
    `;
    changeName() {
        prompt('My Melody');
    }
    async startOutputTextQueue() {
        if (this.data.get('outputing')) {
            return;
        }
        this.data.set('outputing', true);
        await this.outputText();
        this.data.set('outputing', false);

        const content = this.data.get('content');
        if (content.length > 5) {
            this.data.splice('content', [0, content.length - 5]);
        }
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
        if (/[。！？.!?\n]/.test(char)) {
            // const content = this.data.get('content');
            this.data.push('content', ['']);
            // if (content.length > 5) {
            //     content.shift();
            // }
            // content.push(['']);
            // this.data.set('content', content.concat());
        }
        $content && requestAnimationFrame(() => $content.scrollTo({
            top: $content.scrollHeight - 1,
            behavior: 'smooth'
        }));
        await sleep(1e2);
        return this.outputText();
    }
    toggleWhiteBoard() {
        const nextState = !this.data.get('showWhiteBoard');
        this.data.set('showWhiteBoard', nextState);
        if (nextState) {
            this.nextTick(() => this.ref('white-board').focus());
        }
        this.data.set('showSetting', false);
    }
    toggleSetting() {
        this.data.set('showSetting', !this.data.get('showSetting'));
        this.data.set('showWhiteBoard', false);
    }
    onPaste(e) {
        e.preventDefault();
        this.ref('white-board').blur();
        const text = e.clipboardData.getData('text').split(/[\n\r]/).filter(i => i);
        this.data.set('content', text);
        this.data.set('showWhiteBoard', false);
        const $content = e.currentTarget;
        requestAnimationFrame(() => $content.scrollTo({
            top: $content.scrollHeight - 1,
            behavior: 'smooth'
        }));
    }
    attached() {
        this.textQueue = [];
        const socket = io();
        socket.on('output', message => {
            this.textQueue.push(...message);
            this.startOutputTextQueue();
        });
    }
    initData() {
        const name = localStorage.getItem('username');
        const noBorderMode = localStorage.getItem('noBorderMode');
        return {
            content: [['']],
            ip: [],
            name: name || 'My Melody',
            showSetting: false,
            outputing: false,
            noBorderMode
        };
    }
}

const app = new App();
app.attach(document.body);
