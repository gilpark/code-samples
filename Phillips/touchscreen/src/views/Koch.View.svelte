<script>

    import {userInactive$, viewState$, VIEWSTATE, page_scroll} from "../api/store"
    import {vector, calc, } from '@js-basics/vector'
    import ScreenBlock from "../components/ScreenBlock.svelte";
    import TextBlock from "../components/TextBlock.svelte";
    import HeaderFooterBlock from "../components/HeaderFooterBlock.svelte";
    import SlideBlock from "../components/SlideBlock.svelte";
    import ScrollBlock from "../components/ScrollBlock.svelte";
    import GridExpandBlock from "../components/GridExpandBlock.svelte"
    import SwipeGuard from "../utils/swipe-guard"
    import {onMount} from "svelte";
    import ScrollDots from "../components/ScrollDots.svelte"
    const setViewState = (viewID) => viewState$.pushViewSate(viewID)
    const blockVerticalSwipe = new SwipeGuard()
    let slideIdx
    
    //page 1 content
    const page1_header = {
        logoUrl: './assets/Koch/Koch_Banner.png',
    }
    const page1_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 6.3rem; color: var(--koch-main-color); line-height: 6rem; padding-top: 4rem;`,
        copyStyle: 'font-size:2.1rem; line-height: 3rem; padding-top:3rem',
        headline: `We Are Koch.`,
        copy: 'Our life\'s work is to help people improve their lives by making and innovating products and services our customers value. Our focus is on deliverling mutual benefit: win-win outcomes that make life better for customers and employees alike.'
    }
    const page1_text_1 = {
        blockStyle: '',
        copyStyle: 'font-size:2.1rem;    line-height: 3rem; padding-top:3rem',
        headline: ``,
        copy: 'Spanning from high-tech\'s leading edge to the rugged world of ranching, our companies might seem unrelated. Yet when you look deeper, a common goal ties us all together: To be a preferred partner for our customers - driving continuous improvement and perpetual transformation, and to improve the products that meet your needs. <span style=\"font-weight:500;color:var(--koch-main-color);\">Every single day.</span>'
    }

    //page 2 content
    const page2_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 6rem; color: white; line-height: 6.1rem; padding-top: 4.4rem;  `,
        copyStyle: 'font-size:2.1rem; line-height: 3.3rem; color:white; padding-top:8rem; padding-right:7rem;padding-left:1rem; ',
        headline: `Market-Based<br/> Management<br/> Philosophy`,
        copy: 'To succeed in today\'s world of rapid change, we must have a heightened sense of urgency and the commitment to continually transform our performance.  Our approach, Market-Based Management<sup style="font-size:1.2rem;">®</sup>, encourages and equips individuals to practice lifelong learning, drive innovation, embrace transformation and achieve self-actualization – all contributing to a healthy, growing organization.'
    }
    // const page2_scrollBlock_style ="padding-top:4rem; width:calc(100% + var(--page-side-padding) * 0.5) !important; margin-left: calc( var(--page-side-padding) * -1) !important;"
    const page2_grid = {
        blockStyle: 'background: #ededed',
    }

    //page 3 content
    const page3_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 4.2rem; color: var(--koch-main-color); line-height: 4rem; padding-top: 6rem; padding-left: 3rem; `,
        copyStyle: 'font-size:2.1rem;    line-height: 3rem; padding-top:3rem; padding-left: 3rem;',
        headline: `Investing in the Future, <br/>  Acquisitions & Investments`,
        copy: 'At Koch, we like to invest. And reinvest. A lot. Historically 90% <br/>of our earnings have been reinvested into our businesses. At the same time, we also invest sizably in our communities and <br/>in society at large.'
    }
    const page3_text_1 = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 4rem; color: var(--koch-main-color); line-height: 4rem; padding-top: 4rem; padding-left: 3rem; `,
        copyStyle: 'font-size:2.1rem;    line-height: 3rem; padding-top:3rem; padding-left: 3rem;',
        headline: `Why?`,
        copy: 'To make things better by creating long-term value for our employees, communities and businesses.'
    }
    const page3_slides = {
        items: [
            {id: 0,buttonName:"A Decade of<br/> Acquisitions &<br/> Investments", src: './assets/Koch/artboard.png', scroll:true, scollStyle:'min-height:1200px;padding-right:100px;', wrapperStyle:'margin-left: 88px;margin-right:-100px;'},
            {id: 1,  buttonName:"Cutting-Edge<br/> Brain Surgery" ,
                videoUrl: "/assets/Koch/b2.mp4",
                videoPoster: "/assets/Koch/b2_poster.png",
                videoStyle: "width: 1860px; margin: auto; border: 6px solid #ffffff;"},
            {id: 2, buttonName:"Beauty and<br/> Performance",
                videoUrl: "/assets/Koch/b3.mp4",
                videoPoster: "/assets/Koch/b3_poster.png",
                videoStyle: "width: 1860px; margin: auto; border: 6px solid #ffffff;"},
        ],
        isType1: false,
        wrapperStyle: "padding-top: 5rem;margin-right:-100px;",
        imageClass: "global-phil-image",
        type2OnButtonUrl:"/assets/Koch/Koch_TabButton_On.png",
        type2OffButtonUrl:"/assets/Koch/TabButton_Off.png",
        parallax: true,
        obj1: {
            width: '2200',
            height: '1400',
            s: 1600,
            d: 480,
            y: 780,
            img: "/assets/Koch/Koch_bigCircle_pg3.png"
        },
        obj2: {
            width: '2200',
            height: '210',
            s: 1400,
            d: 620,
            y: 580,
            img: "/assets/Koch/Koch_CircleAndLine_Pg3.png"
        }
    }

    //page 4
    const page4_text_title = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 5rem; color: white; line-height: 4rem; padding-top: 10rem; padding-left: 5.5rem; font-weight:600; `,
        headline: `Global Scale`,
        copyStyle: 'font-size:2.1rem; line-height: 3rem; color:white; padding-top: 6rem; padding-left: 5.5rem;',
        copy: "Koch Industries is one of the largest private companies in America. Based in Wichita, Kansas, Koch creates and innovates a wide spectrum of products, technologies and services that make life better."
    }
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


</script>
<!--<svelte:window bind:scrollY={y}/>-->
<div class="global-page-noScrollBar"
     on:touchstart={blockVerticalSwipe.touchStart}
     on:touchmove={blockVerticalSwipe.touchMoves}
     bind:this={element}
>
<!--    page 1-->
<ScreenBlock bind:offsetTop={page1_offsetTop} bind:isElementVisible={page1_visible} bgUrl="./assets/Koch/Koch_FlowLine_Pg1.png">
    <HeaderFooterBlock {...page1_header}/>
    <TextBlock {...page1_text}/>
    <TextBlock {...page1_text_1}/>
</ScreenBlock>

<!--    page 2-->
<ScreenBlock bind:offsetTop={page2_offsetTop} bind:isElementVisible={page2_visible} bgUrl="./assets/Koch/Koch_FlowLine_Pg2.png" bgColor="var(--koch-main-color)">
    <TextBlock {...page2_text}/>
    <GridExpandBlock {...page2_grid}/>
</ScreenBlock>

<!--    page 3-->
<ScreenBlock bind:offsetTop={page3_offsetTop} bind:isElementVisible={page3_visible} bgUrl="./assets/Koch/Koch_FlowLine_Pg3.png">
    <TextBlock {...page3_text}/>
    <TextBlock {...page3_text_1}/>
    <SlideBlock {...page3_slides} bind:index="{slideIdx}"/>
    {#if slideIdx === 0}
        <img src="./assets/SwipeGIF_blue.gif" class="koch-p3-indicator">
    {/if}
</ScreenBlock>

<!--    page 4-->
<ScreenBlock bind:offsetTop={page4_offsetTop} bind:isElementVisible={page4_visible} bgUrl="./assets/Koch/4K_Version_9.png" >
    <TextBlock {...page4_text_title}/>
</ScreenBlock>

<ScrollDots {dots} />
</div>

