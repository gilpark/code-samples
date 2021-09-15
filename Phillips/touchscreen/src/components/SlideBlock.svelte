<script>
    import testItems from '../api/cards.js'
    import { Slidy } from 'svelte-slidy'
    import {tutorialState$, viewState$} from "../api/store";
    import {fade} from 'svelte/transition'
    import ScrollBlock from './ScrollBlock.svelte'
    import MediaBlock from "../components/MediaBlock.svelte";
    import SpinNew from './Spinner.svelte'
    import {onMount} from "svelte"
    import VideoPlayer from 'svelte-video-player'

    export let items = testItems
    export let startIndex = 0
    export let slideClass = ''
    export let preButtonUrl = ''
    export let nextButtonUrl = ''
    export let isType1 = true
    export let wrapperStyle =""
    export let imageClass = ""
    export let textStyle = ""
    export let type2OnButtonUrl = ""
    export let type2OffButtonUrl = ""

    export let parallax = false
    export let obj1 = {
        width: '2200',
        height: '1400',
        s: 1600,
        d: 480,
        y: 880,
        img: "/assets/Koch/Koch_bigCircle_pg3.png"
    },
    obj2 = {
        width: '2200',
        height: '210',
        s: 1400,
        d: 620,
        y: 680,
        img: "/assets/Koch/Koch_CircleAndLine_Pg3.png"
    }

    let isMounted = false
    let wrapper = undefined
    $: slidyConfig = null

    let view = viewState$.stream
    onMount(()=> {
        isMounted = true
        console.log(wrapper.clientHeight, wrapper.clientWidth, $view)
        let wrapperWidth = $view === '#KOCH'? 2100 : wrapper.clientWidth
        slidyConfig =  {
            slides: items,
            timeout: 1000,
            // index: 0,
            wrap: {
                id: 'slidy',
                width: `${wrapperWidth}px`,
                // height: `calc(${wrapper.clientHeight}px - var(--slide-top-padding) - var(--slide-top-padding))`,
                padding: '0',
                align: 'middle',
                alignmargin: 0,
            },
            slide: {
                class: `test`,
                gap: 25,
                width: '100%',
                height: 'auto',
                backimg: false,
                imgsrckey: 'src',
                objectfit: 'cover',
                overflow: 'hidden'
            },
            controls: {
                dots: false,
                dotsnum: false,
                dotsarrow: false,
                dotspure: false,
                arrows: false,
                keys: false,
                drag: isType1,
                wheel: false,
            },
            options: {
                axis: 'x',
                loop: false,
                duration: 350,
            }
        }
    })
    export let index = startIndex
    let listLen = items.length
    let videoWrapper
    $:disableNext = index === listLen-1
    $:disablePre = index === 0
    const onNextClicked = (e) =>{
        e.preventDefault()
        if(listLen-1 > index) index++

    }
    const onPreClicked = (e) =>{
        e.preventDefault()
        if(0 < index) index--
    }
    const setSlideIndex = num => e=> {
        index = num
        wrapper.querySelectorAll("VIDEO").forEach(v =>{
            v.pause()
            v.currentTime = 0
        })
    }
    const onImageTouch = e =>{
        tutorialState$.update(v => ({...v, tabDone:true}))
    }
    $:{
        if($view === '#KOCH'){
            const s = document.getElementById('slidy')
            if(s && wrapper) s.style.setProperty('--wrapw', (index === 0? 2100:wrapper.clientWidth) + "px")
        }
    }
</script>

<div class="slide-wrapper" class:fullWidth={!isType1} bind:this={wrapper} style="{wrapperStyle}">
    {#if isMounted}
        {#if !isType1}
            <div style="width: 100%; display: flex;align-items: center; justify-content: center; padding-bottom: 6rem;">
                <div class="control-type2" on:touchstart={onImageTouch}>
                    <div class="type2-button" on:click={setSlideIndex(0)}>
                        <img src="{index===0?type2OnButtonUrl:type2OffButtonUrl}" alt="type2-btn"/>
                        <div class="type2-button-name" class:selected-text={index===0}>{@html items[0].buttonName}</div>

                    </div>
                    <div class="type2-button" on:click={setSlideIndex(1)}>
                        <img src="{index===1?type2OnButtonUrl:type2OffButtonUrl}" alt="type2-btn"/>
                        <div class="type2-button-name" class:selected-text={index===1}>{@html items[1].buttonName}</div>
                        {#if !$tutorialState$.tabDone}
                            <img src="./assets/tapGIF_1.gif" class="tab-icon" transition:fade|local/>
                        {/if}
                    </div>
                    <div class="type2-button" on:click={setSlideIndex(2)}>
                        <img src="{index===2?type2OnButtonUrl:type2OffButtonUrl}" alt="type2-btn"/>
                        <div class="type2-button-name" class:selected-text={index===2}>{@html items[2].buttonName}</div>
                    </div>
                </div>
            </div>
        {/if}

        {#if parallax}
            <div class="parallax-wrapper">
                <div class="obj-no2" 
                height="{obj1.height}" width="{obj1.width}"
                style="transform: translate({obj1.s + (-index * obj1.d)}px,{obj1.y}px);">
                    <img src={obj1.img} alt="circle">
                </div>
                <div class="obj-no1" 
                height="{obj2.height}" width="{obj2.width}"
                style="transform: translate({obj2.s + (-index * obj2.d)}px,{obj2.y}px);">
                    <img src={obj2.img} alt="circle">
                </div>
            </div>
        {/if}

        <Slidy {...slidyConfig} bind:index let:item>
            <div class="slide" >
                {#if item.src}
                    {#if item.scroll}
                        <!--todo get this scroll block working in here-->
                        <ScrollBlock imageUrl="{item.src}" imageStyle="{item.scollStyle}" wrapperStyle={item.wrapperStyle} brand={"#KOCH"} id={0}/>
                    {:else}
                        <div class="image-wrapper {imageClass}">
                                <img alt="{item.header}" src="{item.src}" />
                        </div>
                    {/if}
                {/if}
                {#if item.videoUrl}
                    <div class="video-wraper" style={item.videoStyle}>
                        <VideoPlayer
                        poster={item.videoPoster} source={item.videoUrl} 
                        wrapperStyle={item.wrapperStyle}
                        width="1920" height="1080"
                        controlsHeight='155px'
                        color='#dddddd'
                        borderRadius="0"
                        centerIconSize='140px'
                        trackHeight='46px'
                        thumbSize='44px' />
                    </div>
                {/if}
                {#if item.text}
                    <div style="{textStyle}" class="sub">
                        {@html item.text}
                    </div>
                {/if}
            </div>
<!--    	<span slot="loader">-->
<!--    		<SpinNew />-->
<!--    	</span>-->
        </Slidy>

        {#if isType1}
            <div class="control-type1">
                {#if !preButtonUrl.isEmpty()}
                    <div class="type1-button" on:click={onPreClicked} class:type1-button-disabled={disablePre}>
                        <img src="{preButtonUrl}" alt="pre" style="pointer-events: none"/>
                    </div>
                {/if}
                {#if !nextButtonUrl.isEmpty()}
                    <div class="type1-button" on:click={onNextClicked} class:type1-button-disabled={disableNext}>
                        <img src="{nextButtonUrl}" alt="next" style="pointer-events: none"/>
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>


<style>
    .tab-icon{
        position: absolute !important;
        top: 30%;
        left: 70%;
        height: 200px !important;
        width: auto !important;
        pointer-events: none !important;
        max-width: unset !important;
        max-height: unset !important;
        z-index: 111111;
        opacity: 0.7;
    }
    .slide{
        padding: 1px;
    }
    .fullWidth{
        width: calc( 100% + var(--page-side-padding) * 1) !important;
        margin-left: calc( var(--page-side-padding) * -0.5) !important;
        margin-right: calc( var(--page-side-padding) * 0.5) !important;
    }
    .control-type1{
        z-index: 1;
        width: 100%;
        display: flex;
        /* align-content: space-between; */
        justify-content: space-between;
        padding-top: 3rem;
    }
    .type1-button{
        padding-right: 7rem;
        padding-left: 7rem;
    }
    .type1-button-disabled{
        opacity: 0.5;
    }
    .selected-text{
        color: white;
    }

    .control-type2{
        z-index: 1;
        display: flex;
        background: #BEBEBE;
        border-radius: 5rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }
    .type2-button{
        min-width: 20rem;
        min-height: 7.5rem;
        position: relative;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }
    .type2-button img{
        width: 100%;
        object-fit: cover;
        position: absolute;
    }
    .type2-button-name{
        width: 100%;
        height: 100%;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        position: absolute;
       font-weight:500;
    }

    .sub{
        width: calc(100% - 8rem);
        /* padding-top: 2rem; */
        color: black;
        font-size: 2rem;
        /* font-weight: 600; */
        padding: 2rem 4rem 4rem 4rem;
    }

    .slide-wrapper{
        /*padding-top: var(--slide-top-padding);*/
        width: 100%;
        height: auto;
        flex-grow: 1;
    }
    :global(#slidy span) {
        left: 50%;
        transform: translateX(-50%)
    }
    :global(#slidy ul) {
        align-items: flex-start !important;
    }
    /*@media screen and (min-width: 900px) {*/
    /*    :global(#slidy .slidy-ul li) {width: 33vw;}*/
    /*}*/
    /*@media screen and (max-width: 425px) {*/
    /*    :global(#slidy .slidy-ul li) {width: 100vw;}*/
    /*}*/
    h1 span {color: red}
    h1 {text-align: center}
    :global(.video-wraper .overlay .controls) {
        display: none;
    }
    .parallax-wrapper {
        position: absolute;
    }
    .obj-no1, .obj-no2 {
        position: relative;
        z-index: 0;
        transition: 0.3s all ease;
    }
</style>