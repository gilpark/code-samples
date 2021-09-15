<script>

    import {tutorialState$,userInactive$, viewState$, VIEWSTATE, page_scroll, molex_slider_1} from "../api/store"
    import Slider from '@bulatdashiev/svelte-slider'
    import {fade} from 'svelte/transition'
    import {vector, calc, } from '@js-basics/vector'
    import ScreenBlock from "../components/ScreenBlock.svelte";
    import TextBlock from "../components/TextBlock.svelte";
    import MediaBlock from "../components/MediaBlock.svelte";
    import HeaderFooterBlock from "../components/HeaderFooterBlock.svelte";
    import SlideBlock from "../components/SlideBlock.svelte";
    import ScrollBlock from "../components/ScrollBlock.svelte";
    import SwipeGuard from "../utils/swipe-guard"
    import {onMount} from "svelte";
    import ScrollDots from "../components/ScrollDots.svelte"
    const setViewState = (viewID) => viewState$.pushViewSate(viewID)
    const blockVerticalSwipe = new SwipeGuard()


    let view = viewState$.stream
    const onImageTouch = e =>{
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

    //page 1 content
    const page1_header = {
        logoUrl: './assets/Molex/Molex_Banner.png',
    }
    const page1_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 6.3rem; color: var(--molex-main-color); line-height: 6rem; padding-top: 4rem;`,
        copyStyle: 'font-size:2rem;    line-height: 3rem; padding-top:3rem',
        headline: `We Are Molex.`,
        copy: 'Our customers rely on Molex to deliver breakthrough connectivity at scale. We help them master change and create the most important advances through powerful innovation, engineering excellence, end-to-end supply chain optimization, and world-class manufacturing capabilities.'
    }
    const page1_text_1 = {
        blockStyle: '',
        copyStyle: 'font-size:2.6rem; line-height: 3.8rem; padding-top:3rem; font-weight:500; color:var(--molex-main-color);',
        headline: ``,
        copy: 'We make a connected world possible by enabling technology that transforms the future and improves people’s lives.'
    }

    //page 2 content
    const page2_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 3.5rem; color: white; line-height: 6.1rem; padding-top: 3rem; padding-left:1rem;`,
        copyStyle: 'padding-bottom: 4rem; font-size:2rem; line-height: 3.3rem; color:white; padding-top:1.5rem; padding-right:7rem;padding-left:1rem;',
        headline: `A Legacy of Innovation `, // ** No space available!! <br/>and <br/>Global Electronics Leadership
        copy: 'For more than 80 years, Molex has been making innovation history. It’s in our DNA, and it’s continuously supported by new acquisitions, ideas and talent.'
    }
    const page2_scrollBlock_style ="overflow-y:hidden; height:758px; width:96.7%;"
    const page2_text_1 = {
        blockStyle: '', headline: ``,
        copyStyle: 'font-size:3rem; line-height: 3.8rem; padding-top:3rem; font-weight:600; color:white;',
        copy: 'Driving Innovation in a Changing World'
    }
    const page2_scrollBlock_2_style ="overflow-y:hidden; height:800px; width:96.7%;"
    const page2_text_2 = {
        blockStyle: '',
        headlineStyle: 'font-size:3rem; line-height: 3.8rem; padding-top:1rem; font-weight:600; color:white;',
        copyStyle: 'font-size:1.5rem; line-height: 2rem; padding-top:1.2rem; color:white;',
        headline: `Global Electronics Leadership`,
        copy: `Investing in game changing capabilities - Acquisitions have expanded <br/> innovation and opportunities for customers. `
    }
    const page2_scrollBlock_3_style ="overflow-y:hidden; height:600px; width:96.5%;"

    //page 3 content
    const page3_text = {
        blockStyle: '',
        headlineStyle: ` font-weight:600; font-size: 4.3rem; color: var(--molex-main-color); line-height: 4rem; padding-top: 2rem; padding-left: 3rem; `,
        copyStyle: 'font-size:2rem;    line-height: 3rem; padding-top:3rem; padding-left: 3rem;',
        headline: `Customer Centricity.<br/> Superior Customer Service`,
        copy: 'Customers are our front-and-center focus.  After all, we recognize that our customers have choices when it comes to selecting the best connectivity solutions and products for their critical projects—and our goal is to be their preferred business partner. '
    }
    const page3_slides = {
        items: [
            {id: 0, buttonName:"Elevating Customer Experience",
                videoUrl: "/assets/Molex/b1.mp4",
                videoPoster: "/assets/Molex/b1_poster.png", videoStyle: "width: 1850px; margin: auto; border: 6px solid #ffffff;"},
            {id: 1, buttonName:"Customer Success" ,
                // videoUrl: "/assets/Molex/b2.mp4",
                // videoPoster: "/assets/Molex/b2_poster.png", videoStyle: "width: 1850px; margin: auto; border: 6px solid #ffffff;",
                 src: '/assets/Molex/molex_b2.png'},
            {id: 2, buttonName:"Digital Transformation",
                videoUrl: "/assets/Molex/b3.mp4",
                videoPoster: "/assets/Molex/b3_poster.png", videoStyle: "width: 1850px; margin: auto; border: 6px solid #ffffff;"},
        ],
        isType1: false,
        wrapperStyle: "padding-top: 5rem;",
        imageClass: "global-molex-image",
        type2OnButtonUrl:"/assets/Molex/Molex_TabButton_On.png",
        type2OffButtonUrl:"/assets/Molex/TabButton_Off.png",
        parallax: true,
        obj1: {
            width: '2200',
            height: '1400',
            s: 900,
            d: 220,
            y: -190,
            img: "/assets/Molex/Molex_circle_2.png"
        },
        obj2: {
            width: '2200',
            height: '210',
            s: 460,
            d: 200,
            y: 620,
            img: "/assets/Molex/Molex_circle_1.png"
        }
    }
    const page3_text_1 = {
        blockStyle: '',
        headlineStyle: '',
        copyStyle: 'font-size:2rem; line-height: 3rem; margin-top:-39rem; padding-left: 3rem;',
        headline: '',
        copy: 'We are embracing new digital tools, automated processes and online access to service, sales and support resources that ensure fast, efficient and personalized customer experiences.'
    }

    //page 4
    const page4_text_title = {
        blockStyle: '',
        headlineStyle: ` font-weight:600; font-size: 4rem; color: white; line-height: 4rem; padding-top: 6rem; padding-left: 1rem; `,
        headline: `Global Network of Expertise`,
        copyStyle: '',copy: ''
    }
    const page4_text = {
        blockStyle: '',
        headlineStyle:  `font-weight:600; font-size: 3rem; color: white; line-height: 4rem; padding-top: 14rem; padding-left: 1rem; `,
        copyStyle: 'font-size:2rem; line-height: 3rem; padding-top:2rem; padding-left: 1rem; color: white; padding-bottom: 8rem;',
        headline: `223 locations in 40 countries`,
        copy: 'Accelerating time-to-market through worldwide design, manufacturing, and logistics capabilities.'
    }
    const page4_scrollBlock_style ="height:2800px; width:calc(100% + var(--page-side-padding) * 2) !important; margin-left: calc( var(--page-side-padding) * -1) !important;"
    
    let element
    let page1_visible, page2_visible, page3_visible, page4_visible
    let page1_offsetTop, page2_offsetTop, page3_offsetTop, page4_offsetTop
    let dots = [
        { 'active': true, 'callback': () => { element.scrollTo({ top: page1_offsetTop, left: 0, behavior: 'auto' }) } },
        { 'active': false, 'callback': () => { element.scrollTo({ top: page2_offsetTop, left: 0, behavior: 'auto' }) } },
        { 'active': false, 'callback': () => { element.scrollTo({ top: page3_offsetTop, left: 0, behavior: 'auto' }) } },
        { 'active': false, 'callback': () => { element.scrollTo({ top: page4_offsetTop, left: 0, behavior: 'auto' }) } }
    ]
    onMount(()=>{

        const h = (event) => {
            page_scroll.set(event.target.scrollTop)
            
            dots[0].active = page1_visible
            dots[1].active = page2_visible
            dots[2].active = page3_visible
            dots[3].active = page4_visible
        }
        element.addEventListener('scroll',h)
        return ()=> element.removeEventListener('scroll',h)
    })


    $:slide1Val = [0,100]
    setTimeout(()=>{
        console.log('test')
        slide1Val[0] = 30
    },3000)
</script>
<!--<svelte:window bind:scrollY={y}/>-->
<div class="global-page-noScrollBar"
     on:touchstart={blockVerticalSwipe.touchStart}
     on:touchmove={blockVerticalSwipe.touchMoves}
     bind:this={element}
>
<!--    page 1-->
<ScreenBlock bind:offsetTop={page1_offsetTop} bind:isElementVisible={page1_visible} bgUrl="./assets/Molex/Flowline_1.png">
    <HeaderFooterBlock {...page1_header}/>
    <TextBlock {...page1_text}/>
    <TextBlock {...page1_text_1}/>
</ScreenBlock>

<!--    page 2-->
<ScreenBlock bind:offsetTop={page2_offsetTop} bind:isElementVisible={page2_visible} bgUrl="./assets/Molex/Flowline_2.png" bgColor="var(--molex-main-color)">
    <TextBlock {...page2_text}/>
    <ScrollBlock wrapperStyle="{page2_scrollBlock_style}"  imageUrl='./assets/Molex/Molex_Pg2_Content1.png' brand={"#MOLEX"} id={0} />

<!--    <div class="molex-p2-indicator-1">-->
<!--        val:{$molex_slider_1[0]}-->
<!--        <Slider bind:value={$molex_slider_1} />-->
<!--    </div>-->

    <img src="./assets/SwipeGIF.gif" class="molex-p2-indicator-1">

    <TextBlock {...page2_text_1}/>
    <ScrollBlock wrapperStyle="{page2_scrollBlock_2_style}"  imageUrl='./assets/Molex/Molex_Pg2_Content2.png' brand={"#MOLEX"} id={1} />

    <img src="./assets/SwipeGIF.gif" class="molex-p2-indicator-2" >

    <TextBlock {...page2_text_2}/>
    <div style="height: 100px;"></div>
    <ScrollBlock wrapperStyle="{page2_scrollBlock_3_style}"  imageUrl='./assets/Molex/Molex_Pg2_Content3.png' brand={"#MOLEX"} id={2}/>

    <img src="./assets/SwipeGIF.gif" class="molex-p2-indicator-3" >

</ScreenBlock>

<!--    page 3-->
<ScreenBlock bind:offsetTop={page3_offsetTop} bind:isElementVisible={page3_visible} bgUrl="./assets/Molex/Flowline_3.png">
    <TextBlock {...page3_text}/>
    <SlideBlock {...page3_slides}/>
    <TextBlock {...page3_text_1}/>
</ScreenBlock>

<!--    page 4-->
<ScreenBlock bind:offsetTop={page4_offsetTop} bind:isElementVisible={page4_visible} bgUrl="./assets/Molex/4K_Version_13.png">
    <TextBlock {...page4_text_title}/>
    <TextBlock {...page4_text}/>
    <ScrollBlock wrapperStyle="{page4_scrollBlock_style}"  imageUrl='./assets/Molex/Molex_Map.png' brand={"#MOLEX"} id={3}/>

    {#if !$tutorialState$.swipeDone_molex_4}
        <img src="./assets/SwipeGIF.gif" class="molex-p2-indicator-4" transition:fade|local/>
    {/if}

<!--    <img src="./assets/SwipeGIF.gif" class="molex-p2-indicator-4" style="height: 200px;">-->
</ScreenBlock>

<ScrollDots {dots} />
</div>

