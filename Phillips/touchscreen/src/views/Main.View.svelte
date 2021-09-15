<script>
    import {viewState$, VIEWSTATE, BASE_URL} from "../api/store"
    import ScreenBlock from "../components/ScreenBlock.svelte";
    import Swipeable from "../libs/Swipeable/Swipeable.svelte";
    import MediaBlock from "../components/MediaBlock.svelte";
    import {onMount$} from "svelte-rx";
    import {map, switchMap} from "rxjs/operators";
    import { sineInOut, quintInOut} from 'svelte/easing'
    import BezierEasing from 'bezier-easing'

    let easing = BezierEasing(.65,0,.35,1)
    const setViewState = (viewID) => viewState$.pushViewSate(viewID)
    const innerScreenStype = `
       pointer-event:none;
    `
    const calScreenPos = (screenNum, progress) => (-1 * 100) * (progress - screenNum)
    let pageProgress, mainViewSwipeable
    let viewState = onMount$.pipe(switchMap(_ => viewState$.stream.pipe(map(h => h.replace('#', '')))))
    $:{
        if($viewState === VIEWSTATE.FOUR)mainViewSwipeable.jump(1)
        if($viewState === VIEWSTATE.MAIN)mainViewSwipeable.jump(0)
    }
</script>

<!--<ScreenBlock >-->
    <Swipeable duration="{400}" easing="{easing}" block="{true}" numScreens="{2}" let:current bind:progress={pageProgress} direction="vertical" bind:this={mainViewSwipeable}>
        
        <ScreenBlock className="absolute" screenPos="top:{calScreenPos(0,$pageProgress)}%;">
            <div class="main-text">
                Solutions <br/>Through <br/>Synergy
            </div>
            <div class="buttons">
                <div class="button" on:click={_=>setViewState(VIEWSTATE.KOCH)} style="background: var(--koch-main-color)">
                    <img src="./assets/Koch_White_logo.png" alt="koch" style="width:75%;">
                </div>
                <div class="button" on:click={_=>setViewState(VIEWSTATE.PHIL)} style="background: var(--phil-main-color)">
                    <img src="./assets/PM_White_logo.png" alt="pm" style="width:71%;">
                </div>
                <div class="button" on:click={_=>setViewState(VIEWSTATE.MOLEX)} style="background: var(--molex-main-color)">
                    <img src="./assets/Molex_White_logo.png" alt="Molex" style="width:70%;">
                </div>
            </div>
        </ScreenBlock>
        <ScreenBlock className="absolute" screenPos="top:{calScreenPos(0,$pageProgress)}%; transform: scale({$pageProgress})" >
            <MediaBlock wrapperStyle="
            width: calc(100% - 10rem);
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 5rem;" type="image" url="./assets/Clover.png"/>
        </ScreenBlock>
    </Swipeable>
<!--</ScreenBlock>-->

<style>
    .main-text {
        position: absolute;
        top: 480px;
        left: 240px;
        font-size: 6.8rem;
        color: #0D273F;
        line-height: 1.0em;
        font-family: 'Open Sans', 'Arial Narrow Bold', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
    }
    .buttons{
        width: 100%;
        z-index: 0;
        height: 100%;
        top: 0;
        bottom: 40rem;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
    }
    .button{
        margin: 1rem;
        width: 15rem;
        height: 15rem;
        font-size: 3rem;
        font-weight: bold;
        /*border: 0.5rem solid white;*/
        box-shadow: 0 30px 20px 0 rgba(0,0,0,0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        border-radius: 8rem;
        background: #000000;
        color: white;
    }
</style>
