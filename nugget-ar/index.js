const $ = q => document.querySelector(q)
const playAnim = target => target.setAttribute('animation-mixer', {timeScale: 1})
const stopAnim = target => target.setAttribute('animation-mixer', {timeScale: 0})

let isVideoStarted = false
let isPlayed2End = false
let animobj = {}
let animState = 'enter'
let markerSelected = false


const videoPlayer = {
    schema: { video: { type: 'string' } },
    init: function () {
        const model_entity = $('#screen')
        const object3D = this.el.object3D
        const video = $(this.data.video)
        const videoTexture = new THREE.VideoTexture(video)
        let videoMat = new THREE.MeshBasicMaterial({color: 'white', transparent: false, opacity: 1, map: videoTexture})
        object3D.visible = false
        stopAnim(model_entity)

        this.el.addEventListener('model-loaded', () => {
            const obj = this.el.getObject3D('mesh');
            const anims = obj.animations
            animobj.start_anim = anims[0]
            animobj.idle_anim = anims[1]
            animobj.exit_anim = anims[2]
            animobj.clips = anims
            animobj.mixer = this.el.components["animation-mixer"]
            obj.traverse(node => {
                // if(node.isMesh)console.log(node.name)
                if(node.isMesh && node.name ==='Video_Screen'){
                    node.material = videoMat
                    animobj.node = node
                }
            })
        })

        this.el.addEventListener('animation-finished',function() {
            animobj.mixer.mixer.stopAllAction()
            if(animState === 'enter'){
                console.log('Entrance is done')
                video.play()
                isVideoStarted = true
                let anim = animobj.mixer.mixer.clipAction(animobj.idle_anim)
                anim.setLoop(THREE.LoopRepeat).reset().play()
                animState = 'idle'
                console.log('video should play')
            }
            if(animState === 'idle'){
                console.log('idle is playing')
            }
        },{once:false})

        video.ontimeupdate = function () {
            if(video.duration - video.currentTime < 0.2){
                video.pause()
                animobj.mixer.mixer.stopAllAction()
                window.location.href = './back.html';
                isPlayed2End = true
            }
        }
        let enableMarkersHandler;
        const showImage = ({ detail }) => {
            clearTimeout(enableMarkersHandler)
            if(!markerSelected){
                console.log('found marker: ',detail.name )
                XR8.XrController.configure({imageTargets: [detail.name]})
                markerSelected = true
            }

            if(isPlayed2End)return
            object3D.position.copy(detail.position)
            object3D.quaternion.copy(detail.rotation)
            object3D.scale.set(detail.scale, detail.scale, detail.scale)
            if (!object3D.visible) object3D.visible = true
            if(isVideoStarted) video.play()
            playAnim(model_entity)
        }
        const hideImage = ({ detail }) => {
            object3D.scale.set(3.5, 3.5, 3.5)
            enableMarkersHandler =
                setTimeout(() =>{
                    XR8.XrController.configure({imageTargets: ['gray-new', 'gray-old', 'white-new','white-old','test']})
                    console.log('all markers enabled')
                    markerSelected = false
                },5000)
        }
        this.el.sceneEl.addEventListener('xrimagefound', showImage)
        this.el.sceneEl.addEventListener('xrimageupdated', showImage)
        this.el.sceneEl.addEventListener('xrimagelost', hideImage)
    }
}

document.addEventListener("DOMContentLoaded", function(){
    if(window.location.href.includes("herokuapp.com")){
        window.location.replace("https://www.wunuggets.com/")
    }
    if (location.protocol != 'https:')
    {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    }
    if($('#unlock-btn') !== null){
        console.log("front page")
        let unlock_btn = $('#unlock-btn')
        unlock_btn.addEventListener('click',function () {
            console.log("unlock clicked")
            window.location.href = '../ar-back.html';
        })
    }
    if($('#ar-front') !== null){
        const onxrloaded = () =>{
            XR8.addCameraPipelineModule(
                {name : 'camerastartupmodule',
                    onCameraStatusChange : ({status}) => {
                        if (status == 'requesting') {
                            $('#logo').hidden = false
                        } else {
                            $('#logo').hidden = true
                        }
                    },
                })

        }
        window.onload = () => {window.XR ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)}
        let videoEl = $('#src-video')
        videoEl.pause()
        console.log('ar page')
        AFRAME.registerComponent('vid-player', videoPlayer)
        $('#cam').onclick = () =>{
            window.location.href = '../ar-back.html';
        }
        $('#audio').onclick = () =>{
            if(!isVideoStarted)return
            videoEl.muted = !videoEl.muted;
            $('#audio').style.backgroundImage = `${videoEl.muted?'url(assets/mute.png)':'url(assets/unmute.png)'}`
        }
    }
    if($('#ar-back') !== null){
        const onxrloaded = () =>{
            XR8.addCameraPipelineModule(
                {name : 'camerastartupmodule',
                    onCameraStatusChange : ({status}) => {
                        if (status == 'requesting') {
                            $('#logo').hidden = false
                        } else {
                            $('#logo').hidden = true
                        }
                    },
                })

        }
        window.onload = () => {window.XR ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)}
        let videoEl = $('#src-video')
        videoEl.pause()
        console.log('ar page')
        AFRAME.registerComponent('vid-player', videoPlayer)
        $('#cam').onclick = () =>{
            window.location.href = '../ar-front.html';
        }
        $('#audio').onclick = () =>{
            if(!isVideoStarted)return
            videoEl.muted = !videoEl.muted;
            $('#audio').style.backgroundImage = `${videoEl.muted?'url(assets/mute.png)':'url(assets/unmute.png)'}`
        }
    }
    if($('#back') !== null){
        console.log('back page')

        let now = new Date()
        let lakers = new Date('2019-12-03')
        let NewOrleans = new Date('2019-12-25')
        let Sacramento = new Date('2019-12-29')
        let Charlotte = new Date('2020-01-15')
        let Minnesota = new Date('2020-02-23')
        let OKC = new Date('2020-03-30')
        let Memphis = new Date('2020-04-07')

        const match = $(".msg2>img")
        if(now < lakers){
            console.log("lakers")
            match.src = "assets/exit/games/lakes.png"
        }

        if(now < NewOrleans && now > lakers){
            match.src = "assets/exit/games/newol.png"
            console.log("new ol")
        }

        if(now < Sacramento  && now > NewOrleans){
            match.src = "assets/exit/games/scramento.png"
            console.log("Sacramento")
        }

        if(now < Charlotte  && now > Sacramento){
            match.src = "assets/exit/games/charlotte.png"
            console.log("Charlotte")
        }
        if(now < Minnesota  && now > Charlotte){
            match.src = "assets/exit/games/minesota.png"
            console.log("Minnesota")
        }
        if(now < OKC && now > Minnesota){
            match.src = "assets/exit/games/okc.png"
            console.log("OKC")
        }

        if(now < Memphis && now > OKC){
            match.src = "assets/exit/games/memphis.png"
            console.log("Memphis")
        }

        let link_btn = $('#main')
        link_btn.addEventListener('click',function (e) {
            // console.log('clicked',e.target)

            window.location.href = 'https://www.westernunion.com/us/en/nuggets.html';
        })
    }
})