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
            // self.entity.sound.volume = (b) ? 0 : self.defaultVolume;
            if(b)self.fadeOut(true);
            // if(self.audio)self.audio.volume = (b) ? 0 : self.defaultVolume;
            self.isMuted = b;
            // if(self.audio)console.log(self.audio.volume, "volume...");
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
        // if (self.audio && self.isMuted) self.audio.volume = 0;
        if(self.audio && !self.audio.paused){
            self.audioSync.print(self.audio.currentTime);
            
        }
            
    },300);

  
    // var ios = (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;
    // // Get the device pixel ratio
    // var ratio = window.devicePixelRatio || 1;
    // // Define the users device screen dimensions
    // var screen = {
    //     width : window.screen.width * ratio,
    //     height : window.screen.height * ratio
    // };
    // console.log('screen stats from media player : ', screen);
    // self.onSE = false;
    // // iPhone X Detection
    // if (ios) {
    //     if (screen.width == 1136 && screen.height === 640 ||
    //         screen.width == 640 && screen.height === 1136) {
    //         console.log('WERE ON AN IPHONE SEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
    //         self.onSE = true;
    //     }
    // }
    // 
    // 
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
        
        //check ios SE
        // if(self.onSE){
            window.addEventListener('touchstart',cb, false);
        // }
       
        
        self.audio.onended = () =>{
            self.audioSync.clear();
            self.showSub(false);
            console.log('-------------end vo, remove listener------------------');
            // if(self.onSE){
                window.removeEventListener('touchstart', cb, false);
            // }
          
            audioCB = null;
        };
        
    }, 2000);
};


Audiomanager.prototype.fadeOut = function (isInstant = false) {
    var self = this;
   self.showSub(false);
    // if(self.audio){
    //     window.removeEventListener('touchstart', audioCB, false);
    //     window.removeEventListener('click', audioCB, false);
    //     audioCB = null;
    //     self.audio.pause();
    //     self.audio.currentTime = 0;
    // }
    // if (self.isMuted) return;
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
                // if(self.onSE){
                    if(audioCB)window.removeEventListener('touchstart', audioCB, false);
                // }
               
                audioCB = null;
                self.audio.pause();
                self.tweenStarted = false;
                // self.audio.currentTime = 0;
            }
        })
            .start();
        self.tweenStarted = true;
        setTimeout(() => {
            // if(self.onSE){
                    if(audioCB)window.removeEventListener('touchstart', audioCB, false);
                // }
           
            if(self.audio){
                audioCB = null;
                self.audio.pause();
                // self.audio.currentTime = 0;
            }
        },1001);
    }
};


// Audiomanager.prototype.fadeOut = function (isInstant = false) {
//     var self = this;
//    self.showSub(false);
//     if (self.isMuted) return;
//     //if (self.entity.sound.slot('vo').isPlaying) return;

//     if (isInstant) {
//         self.entity.sound.slot('vo').stop();
//     } else {
//         var data = { value: self.defaultVolume};
//         self.app.tween(data).to({value: 0}, 1.0, pc.Linear)
//             .on('update', function(dt) {
//             self.entity.sound.volume = data.value;
//         })
//             .on('complete', function() {
//             self.entity.sound.slot('vo').stop();
//         })
//             .start();
//     }
// };


// Audiomanager.prototype.update = function(){
//     if(this.currentPlay){
//         console.log(this.currentPlay.currentTime);
//     }
// };

/////////////////////////////////////////////////////////
// Old akuna stuff not in use, but here for reference
/////////////////////////////////////////////////////////
// Audiomanager.prototype.playClick = function() {
//     console.log('play click');

//     var pitch = (Math.random() * (1.1 - 1.0) + 1.0).toFixed(2);

//     this.entity.sound.slot('click').pitch = pitch;
//     this.entity.sound.slot('click').play();
// };


// Audiomanager.prototype.setAmbienceLoop = function(jobType) {
//     console.log('Load ambience loop, jobType: ', jobType);
//     this.entity.sound.slot('ambience').asset = this.quizLoops[jobType];
// };

// Audiomanager.prototype.setAmbienceActive = function(active) {
//     console.log('play ambience?: ', active);

//     if (active) {
//         this.entity.sound.slot('ambience').play();
//     } else {
//         this.entity.sound.slot('ambience').stop();
//     }
// };