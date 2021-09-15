
<script>
    import Joysticks from "./Joysticks.svelte"
    import {viewer_Input$, input$, viewer$, visibleMarker$} from '../api/stores'
    import {debounceTime,auditTime, distinctUntilChanged, repeat, skipUntil, tap, share, map, filter} from "rxjs/operators";
    import {switchMap,take} from "rxjs/operators";
    import {fromEvent, of, combineLatest} from "rxjs";
    import {onMount} from "svelte";
    export let tiltSpeed = 0.5, zoomSpeed = 1

    let hudData = undefined
    export let MAX_HEIGHT = 7000000
    export let MIN_HEIGHT = 100
    export let INVERT_X = false
    export let INVERT_Y = false
    export let ZOOM_OFF = false
    export let Debug = true
    export let SPEED_MUL_NEAR_GROUND = 3
    const MAX_Y = 80
    const ms = fromEvent(document, 'mousemove')

    const getMiles = (i) => i*0.000621371192

    let zoomingIn = false
    let zoomingOut = false
    let lastCalledTime;
    let fps;

    const dataWithRates$ = viewer_Input$.pipe(
        map(d =>{
            const {lat, long, height, zoomLevel, zoom} = d
            hudData = { lat: lat, long:long, height: height, zoomLevel:zoomLevel}
            const adjustedHeight = height - MIN_HEIGHT*0.5
            const speedMulAtLowerHeight = ((adjustedHeight.remap(MIN_HEIGHT, MAX_HEIGHT, 0.00001, 0, true)) * SPEED_MUL_NEAR_GROUND)
            const zoomRate = (adjustedHeight / 100) * zoomSpeed
            // console.log(speedMulAtLowerHeight, SPEED_MUL_NEAR_GROUND)
            const tiltRate = (adjustedHeight.remap(0, MAX_HEIGHT, 0, 1, true)) * tiltSpeed + speedMulAtLowerHeight
            //todo start here
            // const z = (Math.abs(zoom) > 10)?zoom: 0
            return  {tiltRate, zoomRate, adjustedHeight, ...d}
        }),
        // filter(_=> !$visibleMarker$.uiActive),
        share()
    )


    let lastZoomRate = 0
    dataWithRates$.subscribe(d =>{

        zoomingIn = false
        zoomingOut = false

        // return
        const debugPan = document.getElementById('debug')
        if(!lastCalledTime) {
            lastCalledTime = Date.now();
            fps = 0;
            return;
        }
        let delta = (Date.now() - lastCalledTime)/1000;
        lastCalledTime = Date.now()
        fps = 1/delta;
        debugPan.innerText = `${Math.round(fps)}`

        let {lat, long, height, tilt , _viewer, tiltRate, zoomRate, adjustedHeight, zoom} = d

        const camera = _viewer.camera
        const Cesium = window.Cesium
        const newY = lat - tilt.y * tiltRate
        const newX = long - tilt.x * tiltRate
        const fromDegrees = Cesium.Cartesian3.fromDegrees
        let lerpZoomRate = Math.lerp(lastZoomRate,zoomRate, delta)
        let accumulatedDestination = fromDegrees(long, lat, height)

        if(Math.abs(newY) < MAX_Y) {
            const isUiActive = $visibleMarker$.uiActive
            const isTiltNotMoving = Math.abs(tilt.y) > 0.3 || Math.abs(tilt.x) > 0.3
            height = (isUiActive && isTiltNotMoving)? height + 50 : height
            accumulatedDestination = (isUiActive)?fromDegrees(long, lat, height):fromDegrees(newX, newY, height)
        }
        const cameraHeight = camera.positionCartographic.height
        // debugPan.innerText = `${Math.round(zoomRate)}, ${zoom}`
        // console.log(zoom)


        if(!ZOOM_OFF && zoom > 0 && adjustedHeight > MIN_HEIGHT *0.5) {
            const {locations} = $visibleMarker$
            if(locations.length > 0 && height < 900000){
                // debugPan.innerText += `, zoom locations ${locations.length}` 
                // const nearestLocPos = locations[0].marker.position.getValue(_viewer.clock)
                const nearestLocPos = locations[0].marker.position.getValue(Date.now())
                const markerScreenPos = _viewer.scene.cartesianToCanvasCoordinates(nearestLocPos)
                let canvasCenter = new Cesium.Cartesian2(_viewer.container.clientWidth / 2, _viewer.container.clientHeight / 2)
                let tempDistance = Cesium.Cartesian2.distance(canvasCenter, markerScreenPos)
                let distanceMax = _viewer.container.clientHeight * 0.4

                if(tempDistance < distanceMax){
                    // find mid point between two points
                    let p1 = accumulatedDestination
                    // let p1 = camera.position
                    let p2 = nearestLocPos
                    // Compute vector from p1 to p2
                    let p1p2 = new Cesium.Cartesian3(0.0, 0.0, 0.0);
                    Cesium.Cartesian3.subtract(p2, p1, p1p2);
                    // Compute vector to midpoint
                    let halfp1p2 = new Cesium.Cartesian3(0.0, 0.0, 0.0);
                    // mid point distance in ratio
                    Cesium.Cartesian3.multiplyByScalar(p1p2, 0.02, halfp1p2);
                    // Compute point half way between p1 and p2
                    let p3 = new Cesium.Cartesian3(0.0, 0.0, 0.0);
                    p3 = Cesium.Cartesian3.add(p1, halfp1p2, p3);
                    // Force point onto surface of ellipsoid for visualization.
                    let dest  = Cesium.Cartographic.fromCartesian(p3);
                    // console.log('focus set: ' + locationName)

                    // dest.height = cameraHeight - zoomRate * 0.8
                    dest.height = cameraHeight - lerpZoomRate * 0.8
                    let position = Cesium.Cartographic.toCartesian(dest)
                    // camera.setView({ destination: position });
                    accumulatedDestination = position
                }else {
                    // camera.moveForward(zoomRate)
                    let dest  = Cesium.Cartographic.fromCartesian(accumulatedDestination);
                    dest.height = height - lerpZoomRate
                    // dest.height = height - zoomRate
                    accumulatedDestination = Cesium.Cartographic.toCartesian(dest)
                    zoomingIn = true
                }
            }else {
                // camera.moveForward(zoomRate)
                let dest  = Cesium.Cartographic.fromCartesian(accumulatedDestination);
                dest.height = height - lerpZoomRate
                // dest.height = height - zoomRate
                accumulatedDestination = Cesium.Cartographic.toCartesian(dest)
                zoomingIn = true
            }
        } else if(!ZOOM_OFF && zoom < 0 && adjustedHeight < MAX_HEIGHT) {
            // camera.moveBackward(zoomRate)
            let dest  = Cesium.Cartographic.fromCartesian(accumulatedDestination);
            dest.height = height + lastZoomRate
            // dest.height = height + zoomRate
            accumulatedDestination = Cesium.Cartographic.toCartesian(dest)
            zoomingOut = true
        }
        lastZoomRate = zoomRate
        camera.setView({destination: accumulatedDestination})
    })

</script>

<Joysticks visible={Debug} invertInput="{false}" INVERT_X="{INVERT_X}" INVERT_Y="{INVERT_Y}"/>
{#if hudData}
    <div class="hud-wrapper">
        {#if Debug}
            <div>
                <div id="zoom-in" class:active={zoomingIn}>
                </div>
                <div id="zoom-out" class:active={zoomingOut}>
                </div>
            </div>
            <div class="wrapper-info">
                <div> H : {hudData.height.toFixed(3)} m</div>
            </div>
        {/if}
    </div>
    <div class="hud">
        <div class="coords">
            <div> Long: {hudData.lat.toFixed(3)} , Lat: {hudData.long.toFixed(3)}</div>
        </div>
        <div class="height">
            Height(mi.): {getMiles(hudData.height).toFixed(3)}
        </div>
    </div>
{/if}

<style>
    .active{
        background: #22ee22 !important;
    }
    #zoom-in{
        width: 50px;
        height: 50px;
        background: red;
    }
    #zoom-out{
        width: 50px;
        height: 50px;
        background: red;
    }
    .height{
        color: #FFED9F;
    }
    .coords{
        color: #D8B709;
        font-weight: bold;
        gap: 1rem;
    }
    .hud{
        position: absolute;
        z-index: 1111111;
        pointer-events: none;
        width: 100%;
        height: 95%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-direction: column;
    }
    .hud-wrapper{
        position: absolute;
        z-index: 1111111;
        pointer-events: none;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-direction: column;
    }
    .wrapper-info > div{
        font-size: 2vh;
        text-align: center;
        color: white;
        background: rgba(0,0,0,0.6);
        padding: 0.2rem;
    }
    .wrapper-info{
        padding-bottom: 10vh;
    }
</style>