
<script>
    import {isPlayCanvasReady} from '../store/store'
    import {onMount} from "svelte";
    export let appName = "STEAM"
    let video = undefined
    let useWebCamBG = appName !== 'PIPE'

    const bgUrl = appName ==="STEAM"?"assets/steam-bg.jpg":"assets/itec-bg2.jpg"

    let reverse = false;
    onMount(()=>{
        if(video){
            video.addEventListener('timeupdate',()=>{
                const time = 0.1
                const duration = video.duration
                video.currentTime += reverse?(duration - time): time
            })
            video.addEventListener('ended', function() {
                reverse = !reverse
                video.play()
            });
        }
    })

</script>

<!--<video class="bg-cam"-->
<!--       class:show={useWebCamBG && isPlayCanvasReady}-->
<!--       autoplay muted bind:this={video} playsinline >-->
<!--    <source src="./assets/test2.mp4">-->
<!--</video>-->
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
        filter: blur(1px);
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
        opacity: 1;
        visibility: hidden;
    }

    .show{
        visibility: visible !important;
    }

</style>