/*jshint esversion: 6 */
var Audiomanager = pc.createScript('audiomanager');
Audiomanager.attributes.add('css', {type: 'asset', assetType:'css', title: 'CSS Asset'});

Audiomanager.prototype.initialize = function() {
    this.app.on('audio:playcategoryvo', this.playVO, this);
    this.app.on('audio:fadeout', this.fadeOut, this);

    var self = this;
    this.currentPlay = undefined;
    this.isMuted = false;
    this.defaultVolume = this.entity.sound.volume;
    this.subtitles = [];
    this.audio = null;

    self.tweenStarted = false;
    //listen audio mute event
    this.app.on('audio:mute', (b) =>{
        try{
            if(b)self.fadeOut(true);
            self.isMuted = b;
        }catch(e){
            console.error(e);
        }
    });
    this.app.on('mediaplayer:loadplayer', this.fadeOut, this);

    //prepare subtitle
    this.app.on('gamemanager:manifestReady', this.makeSubTexts,this);

    //create a div
    var sub_style = document.createElement('style');
    document.head.appendChild(sub_style);
    sub_style.innerHTML = this.css.resource || '';

    this.container = document.createElement('div');
    this.container.id = 'subContainer';
    this.div = document.createElement('p');
    this.div.id = 'subtitles';
    this.div.className = 'line subs';
    this.container.appendChild(this.div);
    document.body.appendChild(this.container);
    self.showSub(false);

    this.audioSync = audioSync({subtitlesContainer: 'subtitles'});
    //audio time update for subtitle display
    setInterval(()=>{
        if(self.audio && !self.audio.paused){
            self.audioSync.print(self.audio.currentTime);
        }
    },300);
    this.disableSub = true;

    this.app.on('audioManager:hideSub', b =>{
        self.disableSub = b;
        self.showSub(!b);
    }, this);
};

Audiomanager.prototype.showSub = function(show){
    const self = this;
    if(show){
        this.container.style.display = self.disableSub?'none':'grid';
    }else{

        this.container.style.display = 'none';
    }
};

Audiomanager.prototype.makeSubTexts = function(m){
    var self = this;
    const subsPromiseArr = range(0,10)
    .map(idx => {
        const urlArr = jsonPath(m.vo[idx][1], `$.value`);
        return urlArr? urlArr[0] : "";
    }).map(url => url !== ""? fetch(url).then(r=>r.text()) : Promise.resolve(""));
    Promise.all(subsPromiseArr).then(x => self.subtitles = x).catch(console.error);
};

const startAudio = (targetAudio, self, sub) => ()=>{
    if(targetAudio && targetAudio.paused){
        targetAudio.play().then(()=>{
            console.log('-------------start vo------------------');
            if (self.isMuted) targetAudio.volume = 0;
            if(sub !== "") {
                self.audioSync.setText(sub);
                self.showSub(true);
            }
        });
    }
};
let audioCB = null;

Audiomanager.prototype.playVO = function(categoryIndex, url) {
    console.log('play vo for category: ', categoryIndex);

    var self = this;
    const sub = self.subtitles[categoryIndex];
    self.fadeOut();

    if (self.isMuted) {
        return;
    }
    setTimeout(() => {
        self.audioSync.clear();
        const targetAudio = new Audio(url);
        self.audio = targetAudio;
        self.audio.volume = self.defaultVolume;
        const cb =  startAudio(targetAudio,self,sub);
        audioCB = cb;
        cb();
        window.addEventListener('touchstart',cb, false);
        self.audio.onended = () =>{
            self.audioSync.clear();
            self.showSub(false);
            console.log('-------------end vo, remove listener------------------');
              window.removeEventListener('touchstart', cb, false);
            audioCB = null;
        };

    }, 2000);
};


Audiomanager.prototype.fadeOut = function (isInstant = false) {
    var self = this;
   self.showSub(false);
    if(self.tweenStarted && self.audio) {
        self.audio.pause();
        console.log('cut it out!!');
    }
    if (isInstant) {
        if(self.audio){
            if(audioCB)window.removeEventListener('touchstart', audioCB, false);
            audioCB = null;
            self.audio.pause();
            // self.audio.currentTime = 0;
        }
    } else {
        var data = { value: self.defaultVolume};

        self.app.tween(data).to({value: 0}, 1.0, pc.Linear)
            .on('update', function(dt) {

            if(self.audio && !self.isMuted)self.audio.volume = data.value;
        })
            .on('complete', function() {
            if(self.audio){
               if(audioCB)window.removeEventListener('touchstart', audioCB, false);
                audioCB = null;
                self.audio.pause();
                self.tweenStarted = false;
            }
        })
            .start();
        self.tweenStarted = true;
        setTimeout(() => {
            if(audioCB)window.removeEventListener('touchstart', audioCB, false);

            if(self.audio){
                audioCB = null;
                self.audio.pause();
            }
        },1001);
    }
};
