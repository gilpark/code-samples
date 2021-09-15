
<script>
    import {isPlayCanvasReady} from '../store/store'
    import getBuildURLs from '../store/build.urls'

    import {onMount} from "svelte";
    export let appName = "STEAM"
    let container, buildObj = undefined, video = undefined
    onMount(async ()=>{
        buildObj = await getBuildURLs()
    })
</script>


{#if buildObj}
    <iframe id="app-frame" src={buildObj[appName]}  bind:this={container} />
{/if}

<style>
</style>