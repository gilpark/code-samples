<script>
    import CesiumViewer from "./components/CesiumViewer.svelte"
    import InputHandler from "./components/InputHandler.svelte"
    import LocationHandler from "./components/LocationHandler.svelte"
    import {config} from "./api/stores"
    let configReady = false

    fetch('http://localhost:3000/config')
    .then(r => r.json())
    .then(d =>{
        if(d){
            config.set(d)
            console.log('config updated', d)
            configReady = true
        }
    })

</script>

<div class="mask" style="background: radial-gradient(circle, rgba(0,0,0,0) {$config.UI.maskStartCircleSize}, rgba(0,0,0,1) {$config.UI.maskEndCircleSize}, rgba(0,0,0,1) 100%)">
<!--    <img src="./assets/update/Earth_Mask_Vignette.png"/>-->
</div>

{#if configReady}
    <InputHandler />
    <CesiumViewer />
    <LocationHandler />
{:else}
    <div style="position:absolute;top:50%;left:50%;color:yellow;font-size: 48px;">Loading...</div>
{/if}



<style>
    .mask{
        position: fixed;
        pointer-events: none;
        z-index: 1;
        width: 100%;
        height: 100%;
        /*background: radial-gradient(circle, rgba(0,0,0,0) 42%, rgba(0,0,0,1) 48%, rgba(0,0,0,1) 100%);*/
    }
    .mask img{
        width: 100%;
        height: 100%;
        pointer-events: none;
    }
</style>