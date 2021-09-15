import {writable} from "svelte/store";


const isPortrait = writable(false)

window.addEventListener('gesturestart', function(e) {
    e.preventDefault();
    // special hack to prevent zoom-to-tabs gesture in safari
    document.body.style.zoom = 0.99;
}, false);
window.addEventListener('gestureend', function(e) {
    e.preventDefault();
    // special hack to prevent zoom-to-tabs gesture in safari
    document.body.style.zoom = 0.99;
}, false);
window.addEventListener('gesturechange', function(e) {
    e.preventDefault();
    // special hack to prevent zoom-to-tabs gesture in safari
    document.body.style.zoom = 0.99;
}, false);

const handleScreenSize = () =>{
    const isNarrow = (document.body.clientWidth/document.body.clientHeight) < 1.3;
    console.log("is Narrow? ", isNarrow, document.body.clientWidth/document.body.clientHeight)
    isPortrait.set(isNarrow)
}

const handleOrientation = () =>{
    let isLandscapeMode = false;
    if( 'orientation' in window ) {
        const isLandScape = Math.abs(window.orientation) === 90;
        isLandscapeMode = isLandScape;
    } else if ( 'orientation' in window.screen ) {
        const isLandScape = screen.orientation.type === 'landscape-primary' || screen.orientation.type === 'landscape-secondary';
        isLandscapeMode = isLandScape;
    } else if( 'mozOrientation' in window.screen ) {
        const isLandScape = screen.mozOrientation === 'landscape-primary' || screen.mozOrientation === 'landscape-secondary';
        isLandscapeMode = isLandScape;
    }
    console.log("is isLandscapeMode? ", isLandscapeMode)
    isPortrait.set(!isLandscapeMode)
}

window.addEventListener('resize', handleScreenSize, true)
window.addEventListener('orientationchange', handleOrientation, true)
handleOrientation()
handleScreenSize()

export {isPortrait}