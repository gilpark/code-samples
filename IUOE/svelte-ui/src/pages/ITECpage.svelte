<script>
    import {afterUpdate, onMount} from 'svelte';
    import {fade} from 'svelte/transition'
    import {pcMessage$, checkiOS, openFullscreen} from '../store/store'
    import contentObj from '../store/content.itec'
    import {filter} from 'rxjs/operators'
    import {pipe} from 'rxjs'
    import VideoPlayer from "../components/VideoPlayer.svelte";
    export let enterExperience = false

    let isPopup = false
    let content = undefined
    let showTitle = false

    let openVideo = false

    const handleClose = () =>{
        const pc =  document.getElementById('app-frame').contentWindow
        pc.postMessage(JSON.stringify({id:"svelte", data:{action:"close"}}), "*")
        content = undefined
        openVideo = false
        document.getElementById("audio").play()
    }

    onMount(()=>{
        const sub = pcMessage$.pipe(filter(d => d))
            .subscribe(({action, id})=>{
                if(!action)return
                console.log(action, 0)
                switch (action){
                    case "start":
                        showTitle = true
                        break
                    case "hideTitle":
                        showTitle = false
                        break
                    case "showTitle":
                        showTitle = true
                        break
                    case "popup":
                        content = contentObj.data.find(d=> d.id === id)
                        // console.log(content, id)
                        break
                }
            })
        return ()=>{
            sub.dispose()
        }
    })
    // const android = /Android/i.test(navigator.userAgent)
    // afterUpdate(() => {
    //
    //     if (android && !document.fullscreenElement && document.fullscreen) {
    //         console.log("need to fullscreen???")
    //         //openFullscreen()
    //     }
    // });

    const handleVidClick = ()=>{
        openVideo = true
        setTimeout(_=>{
            document.querySelectorAll('VIDEO').forEach(v => v.play())
        },0)
        document.getElementById("play").play()
    }

</script>

<div class="container">
    <div class="content">
        {#if openVideo}
            <VideoPlayer url="{content.videoUrl}" onComplete="{handleClose}"/>
        {/if}
        {#if showTitle}
            <div transition:fade|local class="title">
                INTERNATIONAL TRAINING<br/>
                & EDUCATION CENTER
            </div>
        {/if}

        <!--{#if android}-->
        <!--    <div transition:fade|local class="close-btn full-btn"-->
        <!--         on:click|preventDefault={handleClose}>-->
        <!--        <img src="./assets/Full_Screen_Android_V1.png"/>-->
        <!--    </div>-->
        <!--{/if}-->

        {#if content}
            <div transition:fade|local class="close-btn"
                 on:click|preventDefault={handleClose}>
                <img src="./assets/Arrow_V1-svg.png"/>
            </div>

            <div transition:fade|local class="text-box-wrapper">

                {#if content.imageUrl}
                    <div style="width: 100%; position: fixed; height: 100%; left: 0; top: 0; display: grid; grid-template-columns: 50% 50%;">
                        <div class="text-text-wrapper" >
                            <div class="text-title">
                                {content.title.toUpperCase()}
                            </div>
                            <div class="text-text">
                                {content.text}
                            </div>
                        </div>
                        <div class="text-image" >
                            <img src="{content.imageUrl}"/>
                        </div>
                    </div>

                    {:else}
                    <div class="text-inner-wrapper" style="top:{content.top}; left:{content.left};bottom:{content.bottom};right:{content.right};" >
                        <div class="text-title">
                            {content.title.toUpperCase()}
                        </div>
                        <div class="text-text" on:click|preventDefault={handleVidClick} style="  pointer-events: all !important;">
                            <img src="assets/playbutton.png"/>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}

    </div>
</div>

<style>
    .text-inner-wrapper-split{

    }
    .text-image img{
        object-fit: cover;
        max-height: 100vh;
        /*width: 100%;*/
    }

    .text-text img{
        object-fit: contain;
        max-width: 30vh;
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
        width: 15vh;
        height: 15vh;
        display: flex;
        justify-content: flex-end;
    }
    .full-btn{
        right: 15vh !important;
    }
    .close-btn img{
        max-height: 8vh;
        pointer-events: all;
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
        position: relative;
    }
    .text-box-wrapper{
        /*pointer-events: all;*/
    }
    .text-inner-wrapper{
        position: absolute;
        display: flex;
        flex-direction: column;
        align-content: center;
        justify-content: center;
        align-items: center;
    }
    .text-text-wrapper{
        display: flex;
        flex-direction: column;
        align-content: center;
        font-family: 'Gotham-Book', sans-serif;
        padding: 15%;
    }
    .text-title{
        font-family: Gotham-Bold,sans-serif;
        font-size: 6vh;
    }
    .text-text{
        margin-top: 4vh;
        font-size: 4vh;
    }
</style>