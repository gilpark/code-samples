<script>
    import {userInactive$, viewState$, VIEWSTATE} from "../api/store"
    import ScreenBlock from "../components/ScreenBlock.svelte";
    import TextBlock from "../components/TextBlock.svelte";
    import MediaBlock from "../components/MediaBlock.svelte";
    import HeaderFooterBlock from "../components/HeaderFooterBlock.svelte";
    import SlideBlock from "../components/SlideBlock.svelte";
    import {Swipeable} from '../libs/Swipeable/index'

    const setViewState = (viewID) => viewState$.pushViewSate(viewID)
    export let BRAND = 'test'
    // let viewState = onMount$.pipe(switchMap(_=>viewState$.stream.pipe(map(h => h.replace('#', '')))))
    let pageProgress, brandSwipeable

    const calScreenPos = (screenNum, progress) => (-1 * 100) * (progress - screenNum)
    let screenLen = 4
</script>

<Swipeable numScreens="{screenLen}" let:current bind:progress={pageProgress} direction="vertical" bind:this={brandSwipeable}>
    <ScreenBlock
            bgUrl="./assets/test/test-bg.jpg"
            bgColor="white" className="{current === 0?'current':''}"  screenPos="top:{calScreenPos(0,$pageProgress)}%;">
        <HeaderFooterBlock bgColor="#0099D8"/>
        <TextBlock headlineColor="#0099D8"/>
        <SlideBlock/>
    </ScreenBlock>

    <ScreenBlock className="{current === 1?'current':''}" bgColor="#0099D8" screenPos="top:{calScreenPos(1, $pageProgress)}%;">
        <TextBlock headlineColor="white" copyColor="white"/>
        <MediaBlock type="video" url ='./assets/test/bg.mp4'  fullWidth="{false}"/>
        <MediaBlock type="image" url="https://dummyimage.com/640x360/fff/0099D8" fullWidth="{false}"/>
    </ScreenBlock>

    <ScreenBlock bgColor="white" className="{current === 2?'current':''}" screenPos="top:{calScreenPos(2, $pageProgress)}%;">
        <TextBlock headlineColor="#0099D8"/>
        <SlideBlock/>
    </ScreenBlock>

    <ScreenBlock bgColor="white" className="{current === 3?'current':''}" screenPos="top:{calScreenPos(3, $pageProgress)}%;">
        <TextBlock headlineColor="#0099D8"/>
<!--        <HeaderFooterBlock isFooter="{true}" bgColor="#0099D8"/>-->
    </ScreenBlock>
</Swipeable>
