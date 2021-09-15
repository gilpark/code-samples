<script>
    import {SvelteSubject} from "../utils/SvelteSubject"
    import {onMount, onDestroy} from "svelte"
    import {input$, config} from '../api/stores'
    import '../utils/numbers'
    import io from 'socket.io-client'

    let tilt = undefined
    let zoom = undefined

    const defaultTiltAndZoom = {tilt:{x:0, y:0}, zoom: 0}
    export let invertInput = false
    export let visible = true
    let INVERT_X = $config.CONTROL.INVERT_X
    let INVERT_Y = $config.CONTROL.INVERT_Y
    let INVERT_Z = $config.CONTROL.INVERT_Z

    onMount(()=>{
        const tiltConfig = {
            zone: document.querySelector('#joystick_tilt'),
            mode: 'static',
            size: 100,
            position: {
                left: '75px',
                top: '75px'
            },
            color: 'white'
        }
        const zoomConfig = {
            zone: document.querySelector('#joystick_zoom'),
            mode: 'static',
            size: 100,
            lockY: true,
            position: {
                left: '200px',
                top: '75px'
            },
            color: 'white'
        }

        tilt = nipplejs.create(tiltConfig)
        zoom = nipplejs.create(zoomConfig)
        const resolveToVec2 = (deg) => {
            const rad = Math.PI * deg / 180;
            return {x: Math.cos(rad), y: Math.sin(rad)};
        }

        tilt.on('move', (e,d)=>{
            const {angle} = d
            const data = {tilt: resolveToVec2(angle.degree - (invertInput?360:180)), zoom:0}
            input$.set(data)
        })
        zoom.on('move', (e,d)=>{
            const {angle} = d
            input$.set({ tilt: {x:0, y:0}, zoom: resolveToVec2(angle.degree).y * (INVERT_Z? -1 :1)})
        })
        //on joystick released
        tilt.on('hidden',_=>input$.set(defaultTiltAndZoom))
        zoom.on('hidden',_=>input$.set(defaultTiltAndZoom))
    })


    const socket = io('http://localhost:3000')

    socket.on('connect', function(data) {
        // socket.emit('join', 'Hello World from client');
    })

    let tempX= 0, tempY= 0, tempZ = 0
    socket.on('data', messages => {
        const {x,y,z} = messages
        const targetX = x.remap(-20,20,-1,1,true) * (INVERT_X? -1 :1)
        const targetY = y.remap(-20,20,-1,1,true) * (INVERT_Y? -1 :1)

        //todo config zoom min/max range
        const targetZ =  (z - tempZ).remap(-15,15,-1,1,true)  * (INVERT_Z? -1 :1)
        input$.set({
            tilt: { x: targetX, y: targetY },
            zoom: targetZ
        })
        tempX = x
        tempY = y
        tempZ = z
    })
</script>

<div style="visibility:{visible ? 'visible' : 'hidden'}">
    <div id="joystick_tilt" ></div>
    <div id="joystick_zoom" class="joysticks"></div>
    <p class="tilt label">Tilt</p>
    <p class="zoom label">Zoom</p>
</div>

<style>
.label{
    position: absolute;
    z-index: 111111;
    color: white;
    text-align: center;
    pointer-events: none;
}
.tilt{
    left: 64px;
    top: 10px;
}
.zoom{
    left: 180px;
    top: 10px;
}

</style>