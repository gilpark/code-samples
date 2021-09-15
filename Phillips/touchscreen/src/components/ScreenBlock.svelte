<script>

import {onMount} from "svelte";
import {page_scroll} from '../api/store'

export
    let className = "",
        bgColor = "",
        bgUrl = "",
        bgVideoUrl = "",
        screenPos ='',
        pageIndex = 0,
        offsetTop = 0,
        isElementVisible = false

    export let pageStyle = !bgVideoUrl.isEmpty()? "" : `background-color: ${bgColor};`
    let element
    onMount(()=>{
        offsetTop = element.offsetTop
    })

    page_scroll.subscribe(y => {
        if(!element) return
        // const dist = element.offsetTop !== 0?(element.offsetTop - element.clientHeight * 0.5):0-y
        // const limit = element.offsetTop + element.clientHeight * 0.5
        const thresoldY = y + element.clientHeight * 0.5
        isElementVisible = element.offsetTop <= thresoldY  &&  element.offsetTop + element.clientHeight > thresoldY
        if(!isElementVisible){
            element.querySelectorAll('VIDEO').forEach(v => v.pause())
            // console.log(element.querySelectorAll('VIDEO'), pageIndex)
        }
    })

</script>

<div class="page-frame {className}" style="{pageStyle} {screenPos}" bind:this={element}>
    {#if !bgVideoUrl.isEmpty()}
        <video src="{bgVideoUrl}" muted autoplay loop playsinline class="bg"></video>
    {/if}
    {#if !bgUrl.isEmpty()}
        <img src="{bgUrl}" alt="bg" class="bg"/>
    {/if}

    <div class="flex" >
        <slot></slot>
    </div>
</div>

<style>
    .absolute{

        position: absolute;
    }
    .flex{
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: calc(100% - var(--page-side-padding) * 2);
        height: 100%;
        padding-left: var(--page-side-padding);
        padding-right: var(--page-side-padding);
        z-index: 1;
    }
    .bg{
        position: absolute;
        /* width: 100%; */
        /* height: 100%; */
        object-fit: cover;
        pointer-events: none;
        /*z-index: 0;*/
    }
    .page-frame{
        width: 100%;
        height: 100vh;
        overflow: hidden;
        position: relative;

        /*absolute for full page scroll*/
        /*position: absolute;*/
        /*z-index: -1;*/
    }
</style>