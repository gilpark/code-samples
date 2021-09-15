<script>
    import {viewer$, input$, visibleMarker$, config} from "../api/stores"
    import {onMount$, onDestroy$} from 'svelte-rx'
    import locations, {addMarkerPerLoc, getLocationsInRange} from '../api/api.locations'
    import {distinctUntilChanged, filter, map, tap, startWith, auditTime} from 'rxjs/operators'
    import { combineLatest } from 'rxjs'
    import LazyImage from './LazyImage.svelte'
    import {fade} from "svelte/transition"
    const location$ = onMount$.pipe(addMarkerPerLoc(locations))
    // const TRIGGER_HEIGHT = 400 //at what height we want to open beauty shot UI?
    const SEARCH_RANGE = 1500 //in km


    let popupHeight = $config.UI.imageHeight
    let displayHeight = $config.UI.toggleHeight
    let backgroundColor = $config.UI.backgroundColor
    let MIN_HEIGHT = $config.APP.MIN_HEIGHT

    const focusedLocation$ = combineLatest(viewer$.pipe(auditTime(100)),location$).pipe(
        filter(d => d[0].height < MIN_HEIGHT * 2),
        // filter(d => d[0].zoom < 0),
        map(d =>{
            const {lat, long, height} = d[0]
            const locationList = getLocationsInRange(SEARCH_RANGE, lat, long, d[1])
            const targetHeight = displayHeight + 5
            const isLessThenTargetHeight =  height < targetHeight
            const closestLocation = locationList[0]
            const isLocationIn100m = closestLocation.dist < 0.15
            const isUIactive = isLessThenTargetHeight && isLocationIn100m
            return {uiActive: isUIactive, location:closestLocation}
        }),
        startWith({uiActive: false, location:undefined}),
        tap(d => visibleMarker$.set(d)),
    )

    let uiVisible = false
    let focusedLocation = undefined
    focusedLocation$.subscribe(d =>{
        const {uiActive, location} = d
        uiVisible = uiActive
        focusedLocation = location
    })

</script>

{#if uiVisible && focusedLocation}
    <div id="ImageViewer" style="background:{backgroundColor};" transition:fade|local>
        <div class="content">
            <LazyImage style="height: {popupHeight}" alt="popup" src="http://localhost:3000/popup/{focusedLocation.url}"/>
        </div>
    </div>
{/if}

<style>
    #ImageViewer{
        z-index: 111;
        background: rgba(0,0,0,0.7);
        position: absolute;
        top:0;
        left: 0;
        width:100%; height:100%; transition: all 0.2s ease-in-out;
    }
    .content{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
</style>