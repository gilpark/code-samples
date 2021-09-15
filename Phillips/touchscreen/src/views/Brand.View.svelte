<script>

    import {userInactive$, viewState$, VIEWSTATE} from "../api/store"
    import {vector, calc, } from '@js-basics/vector'
    import ScreenBlock from "../components/ScreenBlock.svelte";
    import TextBlock from "../components/TextBlock.svelte";
    import MediaBlock from "../components/MediaBlock.svelte";
    import HeaderFooterBlock from "../components/HeaderFooterBlock.svelte";
    import SlideBlock from "../components/SlideBlock.svelte";

    const setViewState = (viewID) => viewState$.pushViewSate(viewID)
    export let BRAND = 'test'
    // let viewState = onMount$.pipe(switchMap(_=>viewState$.stream.pipe(map(h => h.replace('#', '')))))

    let initialPosition = vector()
    const touchMoves = e =>{
        const x = e.changedTouches[0].pageX
        const y = e.changedTouches[0].pageY
        const currentPos = vector(x,y)
        let angleDelta = calc(()=>currentPos - initialPosition)
        let rad =  Math.atan2(angleDelta.y,angleDelta.x);
        const sin = Math.abs(Math.sin(rad)).toFixed(3) //y
        const cos = Math.abs(Math.cos(rad)).toFixed(3) //x
        const isVertical = true
        const inRange = (isVertical ?cos :sin) < 0.85 //angle threshold
        if(inRange){
            // console.log('should block??')
            e.stopPropagation()
        }
        console.log('check touchmoves')
    }
    const touchStart = e =>{
        const x = e.changedTouches[0].pageX
        const y = e.changedTouches[0].pageY
        initialPosition = vector(x,y)
    }
</script>
<div class="global-page-noScrollBar"
     on:touchstart={touchStart}
     on:touchmove={touchMoves}
>
    <ScreenBlock
            bgUrl="./assets/test/test-bg.jpg"
            bgColor="white" className=""  screenPos="">
        <HeaderFooterBlock bgColor="#0099D8"/>
        <TextBlock headlineColor="#0099D8"/>
        <SlideBlock/>
    </ScreenBlock>

    <ScreenBlock className=""
                 bgColor="#0099D8" screenPos="">
        <TextBlock headlineColor="white" copyColor="white"/>
        <MediaBlock type="video" url ='./assets/test/bg.mp4'  fullWidth="{false}"/>
        <MediaBlock type="image" url="https://dummyimage.com/640x360/fff/0099D8" fullWidth="{false}"/>
    </ScreenBlock>

    <ScreenBlock bgColor="" className="" screenPos="">
        <TextBlock headlineColor="#0099D8"/>
        <SlideBlock/>
    </ScreenBlock>

    <ScreenBlock bgColor="white" className="" screenPos="">
        <TextBlock headlineColor="#0099D8"/>
        <!--        <HeaderFooterBlock isFooter="{true}" bgColor="#0099D8"/>-->
    </ScreenBlock>
</div>

