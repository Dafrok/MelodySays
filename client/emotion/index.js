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
    <div id="setting" s-if="showSetting">
        <form>
            <div class="field">
                <label>语音密钥</label>
                <div class="form-control">
                    <input type="password" value="{= secret =}">
                </div>
            </div>
            <div class="field">
                <label>情绪密钥</label>
                <div class="form-control">
                    <input type="password" value="{= emotionSecret =}">
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
        <a class="menu-btn {{recording ? 'active' : ''}}" on-click="toggleRecord"><i class="fa fa-{{ waitingForRecord ? 'spinner fa-spin' : recording ? 'stop' : 'play'}}"></i></a>
        <a class="menu-btn {{showSetting ? 'active' : ''}}" on-click="toggleSetting"><i class="fa fa-wrench"></i></a>
    </div>
    <div class="menu-shadow">
        <span class="rest"></span>
        <a class="menu-btn"><i class="fa fa-{{waitingForRecord ? 'spinner fa-spin' : recording ? 'stop' : 'play'}}"></i></a>
        <a class="menu-btn"><i class="fa fa-wrench"></i></a>
    </div>
    <div class="{{!outputing && content.length > 1 ? '' : 'hidden'}} next"></div>
    <div id="white-board" s-ref="white-board" s-if="showWhiteBoard" on-paste="onPaste" contenteditable="true">
    </div>
    <div id="emotion" style="background-image: url(./images/{{emotion}}.gif)">
    </div>
</div>
    `;
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
    async sentiment(text) {
        if (~text.indexOf('谢谢') || ~text.indexOf('感谢')) {
            return this.data.set('emotion', 'thank');
        }
        if (~text.indexOf('对不起') || ~text.indexOf('抱歉')) {
            return this.data.set('emotion', 'sorry');
        }
        const response = await fetch('https://melodicemotion.cognitiveservices.azure.com/text/analytics/v3.1/sentiment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ocp-apim-subscription-key': this.data.get('emotionSecret')
            },
            body: JSON.stringify({
                documents: [
                    {
                        id: Date.parse(new Date),
                        language: 'zh',
                        text
                    }
                ]
            })
        })
        const result = await response.json();
        
        const scores = result.documents[0].confidenceScores;
        let sentiment = result.documents[0].sentiment
        let modifier = '';
        const {neutral, positive, negative} = scores;
        if (neutral < 0.5) {
            if (positive === 1 || negative === 1) {
                modifier = '-max'
            }
            if (positive / negative > 2 || negative / positive > 2) {
                modifier = '-more';
            }
            else if (positive / negative <= 2 || negative / positive <= 2) {
                modifier = '-less'
            }
        }
        this.data.set('emotion', sentiment + modifier);
        console.log('#emo:', {
            scores,
            sentiment
        });
        // this.data.set('emotion', {
        //     scores: result.documents[0].confidenceScores,
        //     sentiment: result.documents[0].sentiment
        // });
    }
    async outputText() {
        if (!this.textQueue.length) {
            return;
        }
        const content = this.data.get('content');
        if (!content[content.length - 1].length) {
            const str = this.textQueue.join('')
            const match = str.match(/.+?[。！？.!?\n]/);
            const text = match ? match[0] : str;
            if (text) {
                await this.sentiment(text);
            }
        }
        const char = this.textQueue.shift();
        const line = content[content.length - 1] + char;
        this.data.set(`content[${content.length - 1}]`, line);
        const $content = document.getElementById('content-inner');
        if (/[。！？.!?\n]/.test(char)) {
            // const content = this.data.get('content');
            this.data.push('content', '');
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
    toggleSetting() {
        const showSetting = this.data.get('showSetting');
        if (showSetting) {
            localStorage.setItem('secret', this.data.get('secret'));
            localStorage.setItem('emotionSecret', this.data.get('emotionSecret'));
            localStorage.setItem('noBorderMode', this.data.get('noBorderMode'));
        }
        this.data.set('showSetting', !showSetting);
        this.data.set('showWhiteBoard', false);
    }
    toggleRecord() {
        const recording = this.data.get('recording');
        const secret = this.data.get('secret');
        const waitingForRecord = this.data.get('waitingForRecord');
        if (waitingForRecord || !secret) {
            return;
        }
        this.data.set('waitingForRecord', true);
        if (recording) {
            this.recognizer.stopContinuousRecognitionAsync(() => {
                this.data.set('waitingForRecord', false);
                this.data.set('recording', false);
            });
            return;
        }

        const speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(secret, 'japanwest');

        speechConfig.speechRecognitionLanguage = 'zh-CN';
        speechConfig.addTargetLanguage('zh-Hans');

        const audioConfig  = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.recognizer = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig);

        const recognizer = this.recognizer;
        recognizer.startContinuousRecognitionAsync(
            () => {
                this.data.set('waitingForRecord', false);
                this.data.set('recording', true);
            },
            err => {
                console.log(err);
                this.data.set('waitingForRecord', true);
                recognizer.stopContinuousRecognitionAsync(() => {
                    this.data.set('waitingForRecord', false);
                    this.data.set('recording', false);
                    this.toggleRecord();
                });
            }
        );
        // recognizer.recognizing = (s, e) => {
        //     console.log(`RECOGNIZING: Text=${e.result.text}`);
        // };
        
        recognizer.recognized = (s, e) => {
            if (e.result.reason == SpeechSDK.ResultReason.TranslatedSpeech) {
                this.textQueue.push(...e.result.text);
                this.startOutputTextQueue();
            }
            // else if (e.result.reason == SpeechSDK.ResultReason.NoMatch) {
            //     console.log("NOMATCH: Speech could not be recognized.");
            // }
        };
        recognizer.canceled = (s, e) => {
            // console.log(`CANCELED: Reason=${e.reason}`);
        
            // if (e.reason == sdk.CancellationReason.Error) {
            //     console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            //     console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            //     console.log("CANCELED: Did you update the key and location/region info?");
            // }
            this.data.set('waitingForRecord', true);
            recognizer.stopContinuousRecognitionAsync(() => {
                this.data.set('recording', false);
                this.data.set('waitingForRecord', true);
            });
        };
    }
    attached() {
        this.textQueue = [];
        /*
        const socket = io();
        socket.on('output', message => {
            this.textQueue.push(...message);
            this.startOutputTextQueue();
        });
        */
    }
    initData() {
        const secret = localStorage.getItem('secret');
        const emotionSecret = localStorage.getItem('emotionSecret');
        const noBorderModeStr = localStorage.getItem('noBorderMode');
        const noBorderMode = typeof noBorderModeStr === 'string' ? JSON.parse(noBorderModeStr) : false;

        return {
            emotion: 'neutral',
            content: [''],
            ip: [],
            showSetting: false,
            outputing: false,
            secret,
            emotionSecret,
            noBorderMode
        };
    }
}

const app = new App();
app.attach(document.body);
