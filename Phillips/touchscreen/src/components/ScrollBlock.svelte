<script>
    import '../utils/common'
    import SwipeGuard from "../utils/swipe-guard"
    import {tutorialState$, viewState$, molex_slider_1} from "../api/store";

    import {fade} from 'svelte/transition'

    //input data
    export let
        imageStyle='',
        wrapperStyle = '',
        imageUrl='./assets/PM/PM_Page2_HorizontalScroll.png',
        brand="",
        id = -1


    const blockVerticalSwipe = new SwipeGuard()
    let view = viewState$.stream
    const onImageTouch = e =>{
        window.sc = e.target
        // console.log($view)
        if($view === '#MOLEX'){
            if(id === 0) tutorialState$.update(v => ({...v, swipeDone_molex_1:true}))
            if(id === 1) tutorialState$.update(v => ({...v, swipeDone_molex_2:true}))
            if(id === 2) tutorialState$.update(v => ({...v, swipeDone_molex_3:true}))
            if(id === 3) tutorialState$.update(v => ({...v, swipeDone_molex_4:true}))
        }else{
            tutorialState$.update(v => ({...v, swipeDone:true}))
        }
    }


    let wrapper = undefined
    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
    //todo 2way bind, use interval instead of touch move, or bind scroillLeft
    const onTouchMoves = e =>{
        if (wrapper && id === 0)$molex_slider_1 = [map_range(wrapper.scrollLeft,  0, wrapper.offsetWidth*2, 0, 100),100]
    }
    $:{
        if (wrapper && id === 0)wrapper.scrollLeft = map_range($molex_slider_1[0], 0, 100, 0, wrapper.offsetWidth*2)
    }
</script>

<div  class="scroll-block" style="{wrapperStyle}"
      bind:this={wrapper}
     on:touchmove={e =>e.stopPropagation()}>
<!--    <div class="scroll-block" style="height: 100%; width: calc(100% - var(&#45;&#45;page-side-padding) * 2); background: white; position: absolute;">-->
        {#if !imageUrl.isEmpty()}
            <img src="{imageUrl}" alt="scroll-content" class="scroll-image" style="{imageStyle}"  on:touchstart={onImageTouch} on:touchmove={onTouchMoves}/>
        {/if}
<!--    </div>-->
</div>
<!--{#if brand === '#KOCH'}-->
<!--    <img src="./assets/SwipeGIF_blue.gif"  style="height: 200px;-->
<!--    position: absolute;-->
<!--    z-index: 11111111111;-->
<!--    left: 50%;-->
<!--    bottom: 0;-->
<!--    min-height: unset;-->
<!--    max-height: unset;-->
<!--    object-fit: unset;-->
<!--    max-width: unset;-->
<!--    width: unset;-->
<!--">-->
<!--    &lt;!&ndash;    <img src="./assets/SwipeGIF.gif" class="swipe-icon" transition:fade|local/>&ndash;&gt;-->
<!--{/if}-->

<style>

    .swipe-icon{
        position: absolute !important;
        top: 15%;
        left:25%;
        height: 300px !important;
        opacity: 1;
        width: auto !important;
        pointer-events: none !important;
        max-width: unset !important;
        max-height: unset !important;
        z-index: 111111;
    }
    .scroll-image{
        height: 100% !important;
        width: auto !important;
        pointer-events: all !important;
        max-width: unset !important;
        max-height: unset !important;
    }
    .scroll-block{
        position: relative;
        width: 100%;
        z-index: 1;
        overflow-x: scroll;
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
        overflow-y: hidden;
    }
    .scroll-block::-webkit-scrollbar {
        display: none;
    }
</style>