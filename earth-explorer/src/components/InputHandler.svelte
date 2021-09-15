
<script>
    import Joysticks from "./Joysticks.svelte"
    import {viewer_Input$, input$, viewer$, visibleMarker$, config} from '../api/stores'
    import {share, map, filter} from "rxjs/operators"
    import {fromEvent, of, combineLatest} from "rxjs"
    import {onMount} from "svelte"
    import {MathHelper} from "../utils/numbers"

    let tiltSpeed = $config.CONTROL.TILT_SPEED,
        zoomSpeed = $config.CONTROL.ZOOM_SPEED

    let hudData = undefined
    let joystickVisible = $config.DEBUG.hideAll ? false : $config.DEBUG.joystick
    let HIDE_INFO = $config.DEBUG.hideAll
    let hudHeight = $config.UI.hudHeight
    let hudFontSize = $config.UI.fontSize

    let MAX_HEIGHT = $config.APP.MAX_HEIGHT
    let MIN_HEIGHT = $config.APP.MIN_HEIGHT

    let TILT_X_THRESHOLD = $config.CONTROL.TILT_X_THRESHOLD
    let TILT_Y_THRESHOLD = $config.CONTROL.TILT_Y_THRESHOLD

    let ZOOM_THRESHOLD = $config.CONTROL.ZOOM_THRESHOLD
    let SPEED_MUL_NEAR_GROUND = $config.CONTROL.TILT_SPEED_MUL_NEAR_GROUND

    let INVERT_Z = $config.CONTROL.INVERT_Z

    let MAX_Y = $config.APP.MAX_Y
    const ms = fromEvent(document, 'mousemove')

    let timeoutHandler

    const getMiles = (i) => i*0.000621371192

    let zoomingIn = false
    let zoomingOut = false
    let lastCalledTime
    let fps
    let fpsVisible = $config.DEBUG.fps
    let zoomDebugVal = 0
    let tiltDebugVal = 0
    let CUR_H = 0

    let lastX = 0, lastY= 0, lastZ = 0
    const dataWithRates$ = viewer_Input$.pipe(
        map(d =>{
            const {lat, long, height, zoomLevel, zoom, tilt} = d
            hudData = { lat: lat, long:long, height: height, zoomLevel:zoomLevel}
            const adjustedHeight = height - MIN_HEIGHT*0.5
            const speedMulAtLowerHeight = ((adjustedHeight.remap(MIN_HEIGHT, MAX_HEIGHT, 0.00001, 0, true)) * SPEED_MUL_NEAR_GROUND)
            const MaxZoomRate = (adjustedHeight / 100) * zoomSpeed

            const isNotZomming = Math.abs(zoom) < ZOOM_THRESHOLD
            const isNotTilting_X =  Math.abs(tilt.x) < TILT_X_THRESHOLD
            const isNotTilting_Y = Math.abs(tilt.y) < TILT_Y_THRESHOLD

            // const tiltStarted = isNotZomming && !(isNotTilting_X||isNotTilting_Y) 
            // const zoomStarted = !isNotZomming && !tiltStarted

            const zoomRate = isNotZomming ? 0 : zoom.remap(-1,1,MaxZoomRate * -1, MaxZoomRate)
            const tiltRate = (adjustedHeight.remap(0, MAX_HEIGHT, 0, 1, true)) * tiltSpeed + speedMulAtLowerHeight

            if(!lastCalledTime) {
                lastCalledTime = Date.now();
                fps = 0;
                return;
            }
            let delta = (Date.now() - lastCalledTime)/1000;
            lastCalledTime = Date.now()
            fps = 1/delta;

            let newX = isNotTilting_X ? 0 : lastX
            let newY = isNotTilting_Y ? 0 : lastY
            let newZ = lastZ

            lastX = tilt.x
            lastY = tilt.y
            // console.log(zoom < 0)
            lastZ = zoom //isZomming?zoom: 0

            return   {...d, tilt: {x:newX, y:newY}, zoom:newZ, tiltRate, zoomRate, adjustedHeight}
        }),
        filter(d => d),
        // filter(_=> !$visibleMarker$.uiActive),
        share()
    )

    let lastHeight = 0
    dataWithRates$.subscribe(d =>{
        // console.log(d)
        zoomingIn = false
        zoomingOut = false

        // const debugPan = document.getElementById('debug')
        let {lat, long, height, tilt , _viewer, tiltRate, zoomRate, adjustedHeight, zoom} = d
        // console.log(zoom)

        const camera = _viewer.camera
        const Cesium = window.Cesium
        const newY = lat - tilt.y * tiltRate
        const newX = long - tilt.x * tiltRate

        const fromDegrees = Cesium.Cartesian3.fromDegrees
        let accumulatedDestination = fromDegrees(long, lat, height)

        const isYinRange = Math.abs(newY) < MAX_Y
        const isHeightInRange =  adjustedHeight > MIN_HEIGHT *0.5 && adjustedHeight < MAX_HEIGHT

        if(isHeightInRange) {
            const isUiActive = $visibleMarker$.uiActive
            accumulatedDestination = (isUiActive)?fromDegrees(long, lat, height):fromDegrees(newX, isYinRange?newY:lat, height)
        }
        //letting the tilt working when fully zoomed  out
        else if(adjustedHeight>= MAX_HEIGHT){
            accumulatedDestination = fromDegrees(newX, isYinRange? newY:lat, height)
        }
        else if(adjustedHeight<= MIN_HEIGHT && !$visibleMarker$.uiActive){
            accumulatedDestination = fromDegrees(newX, isYinRange? newY:lat, height+2)
        }

        //GUID MODE LOGIC disabled
        // const {location} = $visibleMarker$
        // const isGuideMode = location.length > 0 && height < MIN_HEIGHT*5 && zoom < 0
        // if(location)console.log(location.dist)
        // if(isGuideMode) {
        //     const nearestLocPos = location.marker.position.getValue(Date.now())
        //     const markerScreenPos = _viewer.scene.cartesianToCanvasCoordinates(nearestLocPos)
        //     let canvasCenter = new Cesium.Cartesian2(_viewer.container.clientWidth / 2, _viewer.container.clientHeight / 2)
        //     let tempDistance = Cesium.Cartesian2.distance(canvasCenter, markerScreenPos)
        //     let distanceMax = _viewer.container.clientHeight * 0.4
        //     if (tempDistance < distanceMax) {
        //         let p1 = accumulatedDestination
        //         let p2 = nearestLocPos
        //         let p1p2 = new Cesium.Cartesian3(0.0, 0.0, 0.0)
        //         Cesium.Cartesian3.subtract(p2, p1, p1p2)
        //         let halfp1p2 = new Cesium.Cartesian3(0.0, 0.0, 0.0)
        //         Cesium.Cartesian3.multiplyByScalar(p1p2, 0.02, halfp1p2)
        //         let p3 = new Cesium.Cartesian3(0.0, 0.0, 0.0)
        //         p3 = Cesium.Cartesian3.add(p1, halfp1p2, p3)
        //         let dest = Cesium.Cartographic.fromCartesian(p3)
        //         zoomRate *= 0.8
        //         height = camera.positionCartographic.height
        //         let position = Cesium.Cartographic.toCartesian(dest)
        //         accumulatedDestination = position
        //     }
        // }


        let dest = Cesium.Cartographic.fromCartesian(accumulatedDestination)

        if(height >=MAX_HEIGHT && zoom > 0) {
            zoomRate = 0
        }
        if(height <=MIN_HEIGHT && zoom < 0) {
            zoomRate = 0
        }
        dest.height = height  + zoomRate
        // lastZ = zoom
        // console.log(lastHeight - dest.height)
        accumulatedDestination = Cesium.Cartographic.toCartesian(dest)
        camera.setView({destination: accumulatedDestination})
        lastHeight = dest.height

        CUR_H = dest.height
        // zoomDebugVal = zoom.toFixed(2)
        zoomingIn = lastZ < 0
        zoomingOut = lastZ > 0
        
        if(!window.animateTilt){
            let animateTilt = () => {
            const YinRange = Math.abs(lat-40) < 2
            let direction = (lat-40) > 0? -1 : 1
            if(!YinRange)lat  = lat+ direction
            long = long + $config.APP.TIMEOUT_TILT_X
            camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(long, lat, $config.APP.MAX_HEIGHT),
                easingFunction : Cesium.EasingFunction.LINEAR_NONE,
                duration : 1,
                complete : window.animateTilt
            })
        }
        window.animateTilt  = animateTilt
        }
        
        // IDLE Checker
        if (zoomRate || tilt.x || tilt.y) {
            camera.cancelFlight() // cancel camera flight if it still running
            if (timeoutHandler) {
                clearTimeout(timeoutHandler)
                timeoutHandler = undefined
            }
            timeoutHandler = setTimeout(() => {
                let duration = height.remap(
                    $config.APP.MIN_HEIGHT,
                    $config.APP.MAX_HEIGHT,
                    $config.APP.TIMEOUT_MAX_ZOOM_OUT_DURATION,
                    1)
                console.log('zoom out started -> duration:', duration)
                long = long + $config.APP.TIMEOUT_TILT_X
                camera.flyTo({
                    destination : Cesium.Cartesian3.fromDegrees(long, lat, $config.APP.MAX_HEIGHT),
                    easingFunction : Cesium.EasingFunction.EXPONENTIAL_IN,
                    duration :duration,
                    complete : window.animateTilt
                })
            } ,$config.APP.TIMEOUT_SECONDS)
        }
    })

</script>

<Joysticks visible={joystickVisible}/>
{#if hudData}
    <div class="hud-wrapper">
        {#if !HIDE_INFO}
            <div class="indicator-wrapper-right">
                <div>
                    <div id="zoom-in" class:active={zoomingOut}/>
                    <div id="zoom-out" class:active={zoomingIn}/>
                </div>
                <div>
                    <div class="wrapper-info" >
                        <div > MAX__H : {MAX_HEIGHT} m</div>
                        <div > HEIGHT : {Math.round(CUR_H)} m</div>
                        <div > MIN__H : {MIN_HEIGHT} m</div>
                    </div>
                </div>
            </div>
            <div class="indicator-wrapper-left">
                <div>
                    <div class="wrapper-info">
                        <div style="display:{fpsVisible?"block":"none"};"> fps : {Math.round(fps)}</div>
                        <div> t_X : {lastX.toFixed(2)}</div>
                        <div> t_Y : {lastY.toFixed(2)}</div>
                        <div> zoom : {lastZ.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <div class="hud" style="font-size: {hudFontSize};height:{hudHeight};">
        <div class="coords">
            <div> Long: {hudData.lat.toFixed(3)} , Lat: {hudData.long.toFixed(3)}</div>
        </div>
        <div class="height">
            Height(mi.): {getMiles(hudData.height).toFixed(3)}
        </div>
    </div>
{/if}

<style>
    .indicator-wrapper-left{
        position: fixed;
        top: 20%;
        left: 30%;
        opacity: 0.5;
        display: flex;
    }

    .indicator-wrapper-right{
        position: fixed;
        top: 20%;
        right: 30%;
        opacity: 0.5;
        display: flex;
    }
    .active{
        background: #22ee22 !important;
    }
    #zoom-in{
        width: 2rem;
        height: 50%;
        background: red;
    }
    #zoom-out{
        width: 2rem;
        height: 50%;
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
        /* height: 95%; */
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
        text-align: left;
        color: white;
        background: rgba(0,0,0,0.6);
        padding: 0.2rem;
    }
    .wrapper-info{
        /*padding-bottom: 10vh;*/
    }
</style>