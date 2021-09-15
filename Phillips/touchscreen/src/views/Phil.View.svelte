<script>

    import {userInactive$, viewState$, VIEWSTATE, page_scroll} from "../api/store"
    import {vector, calc,} from '@js-basics/vector'
    import ScreenBlock from "../components/ScreenBlock.svelte";
    import TextBlock from "../components/TextBlock.svelte";
    import MediaBlock from "../components/MediaBlock.svelte";
    import HeaderFooterBlock from "../components/HeaderFooterBlock.svelte";
    import SlideBlock from "../components/SlideBlock.svelte";
    import SwipeGuard from "../utils/swipe-guard"
    import ScrollBlock from "../components/ScrollBlock.svelte";
    import {onMount} from "svelte";
    import ScrollDots from "../components/ScrollDots.svelte"

    const setViewState = (viewID) => viewState$.pushViewSate(viewID)
    // let viewState = onMount$.pipe(switchMap(_=>viewState$.stream.pipe(map(h => h.replace('#', '')))))
    const blockVerticalSwipe = new SwipeGuard()

    //page 1 content
    const page1_header = {
        logoUrl: './assets/PM/PM_Banner.png',
    }
    const page1_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 6.3rem; color: var(--phil-main-color); line-height: 7rem; padding-top: 4rem;`,
        copyStyle: 'font-size:2.1rem; line-height: 3rem; padding-top:3rem; ',
        headline: `Bringing <br/>Possibilities to Life.`,
        copy: 'At Phillips-Medisize, a Molex company, we know that your success is our success.  For more than 60 years, we have been trusted by the world\'s leading healthcare, consumer, and automotive companies to deliver safe and effective solutions that help people live healthier, more productive lives.'
    }
    const page1_slides = {
        items: [
            {id: 0, src: '/assets/PM/slides1/0.png'},
            {id: 1, src: '/assets/PM/slides1/1.png'},
            {id: 2, src: '/assets/PM/slides1/2_center.png'},
            {id: 3, src: '/assets/PM/slides1/3.png'},
            {id: 4, src: '/assets/PM/slides1/4.png'},
            {id: 5, src: '/assets/PM/slides1/5.png'},
        ],
        startIndex:0,
        preButtonUrl: './assets/PM/PM_LeftButton.png',
        nextButtonUrl: './assets/PM/PM_RightButton.png',
        isType1: true,
        wrapperStyle: "padding-top: 11rem;",
        imageClass: "global-phil-image"
    }



    //page 2 content
    const page2_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 4.2rem; color: white; line-height: 4.5rem; padding-top: 4rem;`,
        copyStyle: 'font-size:2.1rem; line-height: 3rem; color:white; padding-top:6rem;  padding-right:4rem;',
        headline: `Unparalleled Quality <br/>and Execution`,
        copy: 'Unparalleled product quality and flawless execution are paramount to successfully delivering products that realize exceptional outcomes.'
    }
    const page2_scrollBlock_style ="overflow-y:hidden;margin-top:6rem; width:calc(100% + var(--page-side-padding) * 0.5) !important; margin-left: calc( var(--page-side-padding) * -1 + -6px) !important;"
    const page2_text_1 = {
        blockStyle: '',
        copyStyle: 'font-size:2.1rem; line-height: 3rem; color:white; padding-top:4.5rem; padding-right:4rem;',
        headline: ``,
        copy: "Adhering to Six Sigma quality efforts company wide, Phillips-Medisize\'s project teams strive to meet or exceed your expectations for quality, cost, delivery, and service. Our program management ensures your product is on the market quickly, efficiently, and profitably.<div style=\'display: block; height: 6rem;\'></div> Our robust quality management system (QMS) ensures we meet regulatory and compliance requirements across the organization and across the globe. Our commitment to quality and service helps us provide high levels of efficiency and effectiveness in our work at every stage."
    }

    //page 3 content
    const page3_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 4.2rem; color: var(--phil-main-color); line-height: 4rem; padding-top: 4rem; padding-left: 2rem; `,
        copyStyle: 'font-size:2.1rem;  line-height: 3rem; padding-top:6rem; padding-left: 2rem;',
        headline: `Rapid Innovation`,
        copy: 'Product realization is a highly unpredictable journey, but we have the innovation expertise to help you navigate the complex challenges and succeed — quickly and efficiently.'
    }
    const page3_slides = {
        items: [
            // {id: 0, src: './assets/PM/PM_Page2_HorizontalScroll.png', scroll:true , buttonName:"Innovation in Design"},
            {id: 0, buttonName:"Innovation in Design",
                videoUrl: "/assets/PM/pm_b1.mp4",
                videoPoster: "/assets/PM/pm_b1_poster.png",
                videoStyle: "width: 91.5%; margin: auto; border: 6px solid var(--phil-main-color);border-radius: 10px;"},
            {id: 1,buttonName:"Enabling Connectivity in Disposable Devices" ,
                videoUrl: "/assets/PM/pm_b2.mp4",
                videoPoster: "/assets/PM/pm_b2_poster.png",
                videoStyle: "width: 91.5%; margin: auto; border: 6px solid var(--phil-main-color);border-radius: 10px;", text:"In a regulated industry, the best way to be innovative is rarely to reinvent the wheel."},
            {id: 2,buttonName:"Front End Innovation",
                src: '/assets/PM/slides1/Design_Development.png',
                text:"<div style='display: block; height: 2rem;'></div> You need deep market insights to take the lead and introduce differentiated solutions. Our front-end innovation capabilities will give you a competitive edge and market advantage."},
        ],
        preButtonUrl: './assets/PM/PM_LeftButton.png',
        nextButtonUrl: './assets/PM/PM_RightButton.png',
        isType1: false,
        wrapperStyle: "padding-top: 6rem;",
        imageClass: "global-phil-image-2",

        type2OnButtonUrl:"/assets/PM/PM_TabButton_On.png",
        type2OffButtonUrl:"/assets/PM/PM_TabButton_Off.png"
    }

    //page 4
    const page4_text_title = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 4.2rem; color: white; line-height: 4rem; padding-top: 6rem; padding-left: 4rem; `,
        headline: `Ability to Scale`,
        copy: ""
    }
    const page4_text = {
        blockStyle: '',
        headline: ``,
        copy: "As one of the largest CDMO companies, our global footprint and rapid production capabilities allow customers to get to market faster and with more confidence. Together with Molex's global electronics expertise, Phillips-Medisize is a global leader in product realization from early innovation and design through development and global manufacturing.",
        copyStyle: 'font-size:2rem;    line-height: 3rem; color:white; padding-top:45.5rem; padding-right:2rem;',
    }

    const page4_text_1 = {
        blockStyle: '',
        headline: ``,
        copy: "Our global manufacturing capabilities provide the flexibility to rapidly scale up when and where it\'s needed – allowing customers to fulfill products closer to their end-markets and point-of-use while minimizing risks and costs.",
        copyStyle: 'font-size:2.1rem;    line-height: 3rem; color:white; padding-top:3rem; padding-right:2rem;',
    }

    //page 5
    const page5_text = {
        blockStyle: '',
        headlineStyle: `font-weight:600; font-size: 4.2rem; color: white; padding-top: 7rem;`,
        copyStyle: 'font-size:2.1rem; line-height: 3rem; padding-top:3rem; color:white; padding-right:3rem; ',
        headline: `Supply Chain Optimization`,
        copy: 'At Phillips-Medisize, our digital supply chain solutions and advanced procurement services provide end-to-end visibility – helping you quickly scale production, proactively minimize risk, and optimize your supplier networks.   Together with fully integrated demand and business planning processes, we use advanced procurement intelligence and actionable analytics tools to predict and respond to market fluctuations <bt/>at real-time speeds.'
    }
    const page5_text_1 = {
        blockStyle: '',
        copyStyle: 'font-size:2.1rem;line-height: 3rem; padding-top:3rem; color:white; padding-right:3rem',
        headline: ``,
        copy: 'Deep domain and commodity expertise is the key to unparalleled supply chain speed, agility, and resilience.  Our experts proactively analyze and mitigate risks, streamline logistics networks, and control costs.  With access to the powerful global supply chain at Koch and Molex, we are an ideal single partner for your metals, plastics and electronics needs.'
    }
    let element
    let page1_visible, page2_visible, page3_visible, page4_visible, page5_visible
    let page1_offsetTop, page2_offsetTop, page3_offsetTop, page4_offsetTop, page5_offsetTop
    let dots = [
        { 'active': true, 'callback': () => { element.scrollTo({ top: page1_offsetTop, left: 0, behavior: 'auto' }) } },
        { 'active': false, 'callback': () => { element.scrollTo({ top: page2_offsetTop, left: 0, behavior: 'auto' }) } },
        { 'active': false, 'callback': () => { element.scrollTo({ top: page3_offsetTop, left: 0, behavior: 'auto' }) } },
        { 'active': false, 'callback': () => { element.scrollTo({ top: page4_offsetTop, left: 0, behavior: 'auto' }) } },
        { 'active': false, 'callback': () => { element.scrollTo({ top: page5_offsetTop, left: 0, behavior: 'auto' }) } }
    ]
    onMount(()=>{

        const h = (event) => {
            page_scroll.set(event.target.scrollTop)
            
            dots[0].active = page1_visible
            dots[1].active = page2_visible
            dots[2].active = page3_visible
            dots[3].active = page4_visible
            dots[4].active = page5_visible
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
    <ScreenBlock bind:offsetTop={page1_offsetTop} bind:isElementVisible={page1_visible} bgUrl="./assets/PM/PM_LineFlow_Pg1.png">
        <HeaderFooterBlock {...page1_header}/>
        <TextBlock {...page1_text}/>
        <SlideBlock  {...page1_slides}/>

    </ScreenBlock>

<!--    page 2-->
    <ScreenBlock bind:offsetTop={page2_offsetTop} bind:isElementVisible={page2_visible} bgUrl="./assets/PM/PM_LineFlow_Pg2.png" bgColor="var(--phil-main-color)" pageIndex="{1}">
        <TextBlock {...page2_text}/>
        <ScrollBlock wrapperStyle="{page2_scrollBlock_style}"  imageUrl='./assets/PM/PM_Page2_HorizontalScroll.png' brand={"#PHIL"} id={0}/>
        <img src="./assets/SwipeGIF.gif" class="pm-p2-indicator">
        <TextBlock {...page2_text_1}/>
    </ScreenBlock>

<!--    page 3-->
    <ScreenBlock bind:offsetTop={page3_offsetTop} bind:isElementVisible={page3_visible} bgUrl="./assets/PM/PM_LineFlow_Pg3.png" pageIndex="{2}">
        <TextBlock {...page3_text}/>
        <SlideBlock {...page3_slides}/>
    </ScreenBlock>

<!--    page 4-->
    <ScreenBlock bind:offsetTop={page4_offsetTop} bind:isElementVisible={page4_visible} bgUrl="./assets/PM/4K_Version_4.png" pageIndex="{3}">
        <TextBlock {...page4_text_title}/>
        <TextBlock {...page4_text}/>
        <TextBlock {...page4_text_1}/>
    </ScreenBlock>
<!--    page 5-->
    <ScreenBlock bind:offsetTop={page5_offsetTop} bind:isElementVisible={page5_visible} bgUrl="./assets/PM/4K_Version_5.png" pageIndex="{4}">
        <TextBlock {...page5_text}/>
        <TextBlock {...page5_text_1}/>
        <!--        <HeaderFooterBlock isFooter="{true}" bgColor="#0099D8"/>-->
    </ScreenBlock>
    
<ScrollDots {dots} />
</div>

