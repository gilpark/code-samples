import { writable } from 'svelte/store'
import {SvelteSubject} from "../utils/SvelteSubject"
import { fromEvent, of, combineLatest, empty } from 'rxjs'
import {skipWhile, auditTime, catchError, map, filter, distinctUntilChanged , share} from 'rxjs/operators'
import {tiltLerpRate} from "../components/InputHandler.svelte";

//config
function createConfigStore(){
    const config = {
        SERIAL:{
            "serial_port": "COM3",
            "baudRate": 9600,
        },
        UI:{
            imageHeight: "20%", //popup image height (locationHandler.js)
            fontSize:'1rem', //lat, long, height font size (locationHandler.js)
            toggleHeight:400, //popup image display height (locationHandler.js)
            backgroundColor:'rgba(0,0,0,0.6)', //popup bg color  (locationHandler.js)
            hudHeight:'95%', //.hud height (inputHandler.js)
            maskStartCircleSize:"40%",
            maskEndCircleSize:"48%",
            labelAndPinScale:2
        },
        APP:{
            MAX_HEIGHT:50000000, //(app.js, inputHandler.js)
            MIN_HEIGHT:400,//(inputHandler.js)
            MAX_Y:80,//(inputHandler.js),
            chromePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",

            TIMEOUT_SECONDS: 5000,
            TIMEOUT_MAX_ZOOM_OUT_DURATION: 30,
            TIMEOUT_TILT_X: 3
        },
        CONTROL:{
            TILT_SPEED:1,//(inputHandler.js)
            TILT_X_THRESHOLD:0.1, //set newX to 0 if Math.abs(tilt.x) < TILT_X_THRESHOLD (inputHandler.js, line 56)
            TILT_Y_THRESHOLD:0.1, //set newY to 0 if Math.abs(tilt.y) < TILT_Y_THRESHOLD(inputHandler.js, line 57)
            TILT_SPEED_MUL_NEAR_GROUND:3,

            ZOOM_SPEED:1, //(inputHandler.js)
            ZOOM_THRESHOLD:0,//set newZ to 0 if Math.abs(zoom) < ZOOM_THRESHOLD D(inputHandler.js, line 58)

            INVERT_X:false,//(Joysticks.js)
            INVERT_Y:false,//(Joysticks.js)
            INVERT_Z:true,//(Joysticks.js)
        },
        DEBUG:{
            joystick:true,//(inputHandler.js)
            debugHeight:true,//(inputHandler.js)
            fps:true,//(inputHandler.js)
            tilt:true,
            zoom:true,
            hideAll:false //hide all debug info if this is true
        }
    }

    return new SvelteSubject(config)
}
export const config = createConfigStore()

//input data stream
function createInputStore() {
    const defaultTiltAndZoom = { tilt:{x:0, y:0}, zoom: 0}
    return new SvelteSubject(defaultTiltAndZoom)
}
export const input$ = createInputStore()


//cesium data stream
function createViewerStore() {
    const startLat = 37.90622013491295 //(x)
    const startLong = -97.69879936797906 //(y)
    const startHeight = 8000 * 1000
    return new SvelteSubject({
        lat:startLat,
        long:startLong,
        height: startHeight,
        _viewer:null,
        zoomLevel:0,
        block:false
    })
}
export const viewer$ = createViewerStore()

// input & cesium data stream
function createInputAndViewerStore(){

    const parseData = ([viewerData, inputData]) =>{
        return {...viewerData, ...inputData}
    }
    const isDataReady = ([viewerData, inputData]) =>{
        return !(inputData && viewerData && viewerData._viewer)
    }
    return combineLatest(viewer$,input$)
        .pipe(
            auditTime(10),
            skipWhile(isDataReady),
            map(parseData),
            share()
        )
}
export const viewer_Input$ = createInputAndViewerStore()

const toSvelteSubject = (stream, startWidth = null) =>{
    const s = startWidth? new SvelteSubject(startWidth): new SvelteSubject()
    stream.subscribe(s)
    return s
}

export const visibleMarker$ = new SvelteSubject([])