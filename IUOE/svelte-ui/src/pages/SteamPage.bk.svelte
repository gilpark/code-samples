<script>
    import { onMount } from 'svelte';
    import {fade} from 'svelte/transition'

    export let enterExperience = false

    const handleClose = () =>{
        const pc =  document.getElementById('app-frame').contentWindow
       pc.postMessage(JSON.stringify({id:"svelte", data:{action:"close"}}), "*")
    }

    let testVid = false
    const handleVidClick = ()=>{
        testVid = true
        setTimeout(_=>{
            document.querySelectorAll('VIDEO').forEach(v => v.play())
        },0)
    }
    const handleVidClose = () =>{
        document.querySelectorAll('VIDEO').forEach(v => v.pause())
        testVid = false
    }
</script>

{#if testVid}
    <div class="video-wrapper" transition:fade|local>
        <div class="vid-close-btn" on:click|preventDefault={handleVidClose}>X</div>
        <video controls class="video">
            <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4">
        </video>
    </div>

{/if}

<div class="container">
    <div class="content">
        <div class="title">
            STEAM ENGINE
        </div>
        <div class="close-btn" on:click|preventDefault={handleClose}>X</div>
        <div class="vid-btn" on:click|preventDefault={handleVidClick}>
            <img src="/assets/playbutton.png"/>
        </div>
    </div>
</div>

<style>
    .video-wrapper{
        top:0; width:100%;
        height:100%;
        position:fixed;
        z-index:4;
        background: black;
        pointer-events: all;
    }
    .video-wrapper video{
        width: 100%;
        height: 100%;
    }
    .vid-btn{
        width: 20vh;
        cursor: pointer;
        pointer-events: all;
    }
    .vid-btn img{
        object-fit: contain;
        width: 100%;
        height: 100%;
    }
    .vid-close-btn{
        font-family: Gotham-Book,serif;
        right: 1rem;
        font-size: 8vh;
        position: absolute;
        top: 0.5rem;
        cursor: pointer;
        pointer-events: all;
        z-index: 5;
        color: white;
    }



    .close-btn{
        font-family: Gotham-Book,serif;
        right: 0;
        font-size: 8vh;
        position: absolute;
        top: -7.5vh;
        cursor: pointer;
        pointer-events: all;
        z-index:5;
    }
    .title{
        font-size: 9vh;
        position: absolute;
        top: -1.5vh;
    }
    .container{
        pointer-events: none;
        top:0; width:100%;
        height:100%;
        position:fixed;
        z-index:3;
        color:white;
        display: grid;
        grid-template-columns: 13.5vh auto 13.5vh;
        grid-template-rows: 13.5vh auto;

    }

    .content{
        grid-column: 2/3;
        grid-row: 2/3;
        border: solid white 1px;
        /*pointer-events: all;*/
        /*background: rgba(255, 255, 255, 0.66);*/
        position: relative;
    }
</style>