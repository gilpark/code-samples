<script>
    import {fade} from 'svelte/transition'
    export let url = "", onComplete = null
    // These values are bound to properties of the video
    let time = 0;
    let duration;
    let paused = true;

    let showControls = true;
    let showControlsTimeout;

    // Used to track time of last mouse down event
    let lastMouseDown;

    function handleMove(e) {
        // Make the controls visible, but fade out after
        // 2.5 seconds of inactivity
        clearTimeout(showControlsTimeout);
        showControlsTimeout = setTimeout(() => showControls = false, 2500);
        showControls = true;

        if (!duration) return; // video not loaded yet
        if (e.type !== 'touchmove' && !(e.buttons & 1)) return; // mouse not down

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const { left, right } = this.getBoundingClientRect();
        time = duration * (clientX - left) / (right - left);
    }

    // we can't rely on the built-in click event, because it fires
    // after a drag — we have to listen for clicks ourselves
    function handleMousedown(e) {
        lastMouseDown = new Date();
    }

    function handleMouseup(e) {
        if (new Date() - lastMouseDown < 300) {
            if (paused) e.target.play();
            else e.target.pause();
        }
    }

</script>
<div class="video-wrapper" transition:fade>
    <video
            src="{url}"
            on:mousemove={handleMove}
            on:touchmove|preventDefault={handleMove}
            on:mousedown={handleMousedown}
            on:mouseup={handleMouseup}
            bind:currentTime={time}
            on:ended={onComplete}
            bind:duration
            bind:paused>
        <track kind="captions">
    </video>

    <div class="controls" style="opacity: {duration && showControls ? 1 : 0}">


        <div class="info">
            <img src="assets/playbutton.png" style="opacity:{paused ? '1' : '0'}"/>
<!--            <span class="time">{format(time)}</span>-->
<!--            <span>click anywhere to {paused ? 'play' : 'pause'} / drag to seek</span>-->
<!--            <span class="time">{format(duration)}</span>-->
        </div>
        <progress value="{(time / duration) || 0}"/>
    </div>
</div>

<style>
    div {
        position: relative;
    }

    .controls {
        transition: opacity 1s;
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .info {
        display: flex;
        width: 100%;
        justify-content: center;
        font-size: 5vh;
        height: 100%;
    }
    .info img{
        max-width: 20%;
        min-width: 150px;
        height: auto;
        object-fit: contain;
        transition: opacity 1s;
    }

    span {
        padding: 0.2em 0.5em;
        color: white;
        text-shadow: 0 0 8px black;
        /*font-size: 1.4em;*/
        opacity: 0.7;
    }

    .time {
        width: 3em;
    }

    .time:last-child { text-align: right }

    progress {
        display: block;
        width: 100%;
        height: 10px;
        -webkit-appearance: none;
        appearance: none;
        position: absolute;
        bottom: 0;
    }

    progress::-webkit-progress-bar {
        background-color: rgba(0,0,0,0.2);
    }

    progress::-webkit-progress-value {
        background-color: rgba(255,255,255,0.6);
    }

    video {
        width: 100%;
        object-fit: contain;
        height: 100%;
    }
    .video-wrapper{
        position: fixed;
        pointer-events: all;
        top: 0;
        left: 0;
        z-index: 3;
        width: 100%;
        height: 100%;
        background: black;
    }
</style>
