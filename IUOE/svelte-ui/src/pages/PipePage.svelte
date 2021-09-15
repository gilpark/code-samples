<script>
    import { onMount } from 'svelte';
    import {fade} from 'svelte/transition'
    import {pcMessage$} from '../store/store'
    import contentObj from '../store/content.pipe'
    import {filter} from 'rxjs/operators'
    import {pipe} from 'rxjs'
    export let enterExperience = false

    let isPopup = false
    let content = undefined
    let showTitle = false

    const handleClose = () =>{
        const pc =  document.getElementById('app-frame').contentWindow
        pc.postMessage(JSON.stringify({id:"svelte", data:{action:"close"}}), "*")
        content = undefined
        document.getElementById("audio").play()
    }

    onMount(()=>{
        const sub = pcMessage$.pipe(filter(d => d))
            .subscribe(({action, id})=>{
                if(!action)return
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



</script>

<div class="container">
    <div class="content">
        {#if showTitle}
            <div transition:fade|local class="title">HOISTING & PORTABLE</div>
        {/if}

        {#if content}
            <div transition:fade|local class="close-btn"
                 on:click|preventDefault={handleClose}>
                <img src="./assets/Arrow_V1-svg.png"/>
            </div>
            <div transition:fade|local class="text-box-wrapper" style="align-items:{content.align};">
                <div class="text-inner-wrapper" style="padding-left:{content.padding};">
                    <div class="text-title">
                        {content.title.toUpperCase()}
                    </div>
                    <div class="text-text" style="max-width:{content.width};">
                        {content.text}
                    </div>
                </div>
            </div>
        {/if}

    </div>
</div>

<style>

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
        /*border: solid white 1px;*/
        /*pointer-events: all;*/
        /*background: rgba(255, 255, 255, 0.66);*/
        position: relative;
    }
    .text-box-wrapper{
        /*pointer-events: all;*/
        display: flex;
        justify-content: center;
        align-content: center;
        height: 100%;
    }
    .text-title{
        font-family: Gotham-Bold,sans-serif;
        font-size: 6vh;
    }
    .text-text{
        font-family: 'Gotham-Book',sans-serif;
        font-size: 4vh;
        margin-top: 4vh;
        line-height: 5vh
    }
</style>