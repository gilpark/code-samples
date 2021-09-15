
<script>
    import {isPlayCanvasReady} from '../store/store'
    import {onMount} from "svelte";
    export let appName = "STEAM"
    let video = undefined
    let useWebCamBG = appName !== 'PIPE'
    onMount(async ()=>{
        const config = {
            video: {
                width: {
                    min: 256,
                    ideal: 640,
                    max: 960,
                },
                height: {
                    min: 144,
                    ideal: 360,
                    max: 540
                },
                facingMode: 'environment'
            }
        }
        if(video && useWebCamBG){
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia(config)
                    .then(function (stream) {
                        video.srcObject = stream;
                    })
                    .catch(function (err0r) {
                        console.log("Something went wrong!");
                    })
            }
        }
    })

    const bgUrl = appName ==="STEAM"?"assets/steam-bg.jpg":"assets/itec-bg.png"

</script>

<video class="bg-cam" class:show={useWebCamBG && isPlayCanvasReady} autoplay muted bind:this={video} playsinline loop></video>
<img src={bgUrl} class="bg-image" class:show={useWebCamBG && isPlayCanvasReady} />

<style>
    .bg-cam{
        width: 100%;
        height: 100%;
        pointer-events: none;
        /*background: #0072ff;*/
        z-index: 0;
        position: fixed;
        visibility: hidden;
        object-fit: fill;
        filter: blur(50px);
    }
    .bg-image{
        width: 100%;
        height: 100%;
        pointer-events: none;
        /*background: #0072ff;*/
        z-index: 0;
        position: fixed;
        object-fit: fill;
        filter: blur(3px);
        opacity: 0.7;
        visibility: hidden;
    }

    .show{
        visibility: visible !important;
    }

</style>