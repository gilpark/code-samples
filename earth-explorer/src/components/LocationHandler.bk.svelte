<script>
    import {viewer_Input$, viewer$, input$} from "../api/stores"
    import {onMount$, onDestroy$} from 'svelte-rx'
    import locations, {addMarkerPerLoc, getLocationsInRange} from '../api/api.locations'
    import {distinctUntilChanged, filter, map} from 'rxjs/operators'
    import { timer, combineLatest } from 'rxjs';

    const invokeWith = val => f => f(val)
    // const location$ = onMount$.pipe(addMarkerPerLoc(), map(_=>invokeWith(locations))).subscribe(invokeWith(locations))

    const location$ = onMount$.pipe(addMarkerPerLoc(locations))

    const TRIGGER_HEIGHT = 400 //at what height we want to open beauty shot UI?
    const SEARCH_RANGE = 50 //in km

    let uiVisible = false
    let focusedLocation = null

    const checkCoords = (a, b) => {
        // console.log( a.lat === b.lat)
     return a.lat === b.lat && a.long === b.long && a.height === b.height
    }
    const searchLocations = (r, {lat,long, locations }) => getLocationsInRange(r, lat, long,locations)
    const lessThenTargetHeight = (targetHeight, {height}) => height < targetHeight

    // const location
    // input$.subscribe(console.log)

    const onLocationFoundAtHeight$ = combineLatest(viewer_Input$,location$).pipe(
        map(d=> ({...d[0], locations: d[1]})),
        // distinctUntilChanged(checkCoords),
        map(d => ({locationsInRange: searchLocations(SEARCH_RANGE, d),...d})),
        filter(d => d.locationsInRange.length > 0),
        map(d => ({uiActive:lessThenTargetHeight(TRIGGER_HEIGHT, d),...d}))
    )

    onLocationFoundAtHeight$.subscribe(d =>{
        const {uiActive, _viewer, locationsInRange} = d
        // uiVisible = $viewer$.block = uiActive
        // focusedLocation = locationsInRange[0]
        // _viewer.focusedLocations = locationsInRange

        // console.log('range reached: ' + focusedLocation.name)
    })

</script>

{#if uiVisible && focusedLocation}
    <div id="ImageViewer" style="width:100%; height:100%">
        <div class="content">
            {#if focusedLocation.urls.length > 1}
            <img class="image" alt="popup" src="{focusedLocation.urls[0]}"/>
            <img class="image" alt="popup" src="{focusedLocation.urls[1]}"/>
            {:else}
            <img class="image" alt="popup" src="{focusedLocation.urls[0]}"/>
            {/if}
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
    .image{
        object-fit: contain;
        width: 40%;
        height: 40%;
    }
</style>