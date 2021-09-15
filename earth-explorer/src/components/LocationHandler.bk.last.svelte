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
    //TODO REMOVE
    location$.subscribe(_=>console.log('run once'))




    let popupHeight = $config.UI.imageHeight
    let displayHeight = $config.UI.toggleHeight
    let backgroundColor = $config.UI.backgroundColor


    
    const sortByDistance = r => list => getLocationsInRange(r, $viewer$.lat, $viewer$.long, list )
    const lessThenTargetHeight = (targetHeight) =>  $viewer$.height < targetHeight
    const checkVisible = l =>{
        return l.x > 0 && l.x <= $viewer$._viewer.container.clientWidth
            && l.y > 0 && l.y <= $viewer$._viewer.container.clientHeight
    }

    const findVisibleOnScreen = list =>{
        const v = window.Cesium.viewer
        
        return list.map(l =>{
            let markerPos = l.marker.position.getValue(v.clock)
            const pos = $viewer$._viewer.scene.cartesianToCanvasCoordinates(markerPos)
            return {...l, x: pos.x, y:pos.y}
        }).filter(checkVisible)
    }

    const focusedLocation$ = combineLatest(viewer$,location$).pipe(
        map(d=> d[1]),
        map(sortByDistance(SEARCH_RANGE)),
        map(findVisibleOnScreen),
        map(d => ({uiActive: lessThenTargetHeight(displayHeight + 5), locations:d})),
        startWith({uiActive: false, locations:[]}),
        tap(d => visibleMarker$.set(d)),
    )

    let uiVisible = false
    let focusedLocation = undefined
    focusedLocation$.subscribe(d =>{
        const {uiActive, locations} = d
        uiVisible = uiActive
        focusedLocation = locations[0]
    })

</script>

<!-- {#if uiVisible && focusedLocation}
    <div id="ImageViewer" style="background:{backgroundColor};" transition:fade|local>
        <div class="content">
            <LazyImage style="height: {popupHeight}" alt="popup" src="http://localhost:3000/popup/{focusedLocation.url}"/>
        </div>
    </div>
{/if} -->

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