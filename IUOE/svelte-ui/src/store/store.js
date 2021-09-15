import {SvelteSubject} from "../utils/SvelteSubject"
import {writable} from "svelte/store";

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const pcMessage$ = new SvelteSubject(null)
const isPlayCanvasReady = writable(false)
window.addEventListener("message", d => {
    console.log('[svelte:message$]: ',d.data)
    if( IsJsonString(d.data)){
        const parsed = JSON.parse(d.data)
        if(parsed.action === 'start'){
            isPlayCanvasReady.set(true)
        }
        pcMessage$.set(parsed)
    }
}, false)

const checkiOS = () => {
    return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
function openFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
        document.documentElement.msRequestFullscreen();
    }
}
export {pcMessage$, isPlayCanvasReady, checkiOS, openFullscreen}