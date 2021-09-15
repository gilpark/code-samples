<script>
    import {userInactive$, viewState$, VIEWSTATE,} from "../api/store"
    import {onMount} from "svelte";
    import {switchMap} from "rxjs/operators";
    import {onMount$} from "svelte-rx";
    //input data
    export let
        type = 'video',
        fullWidth = false,
        wrapperStyle = "",
        url = 'https://dummyimage.com/640x360/0011ff/aaa'

    //todo do this in pageblock
    let video
    /*
        onMount$.pipe(switchMap(_=>scroll$))
        .subscribe(y =>{
            if(!video) return
            const pageBlock = video.parentNode.parentNode
            const start = pageBlock.offsetTop
            const end = pageBlock.offsetHeight + start
            const pageFocused = start < y && end > y
            if(!pageFocused) video.pause()
        })
     */

</script>

<div class="media-block" style="{wrapperStyle}">
    {#if type === 'video'}
        <video class="media" class:fullWidth={fullWidth} on:timeupdate = {userInactive$.heartBeat}
               src="{url}"
               bind:this={video}
               controls></video>
        {:else}
        <img class="media" class:fullWidth={fullWidth}  src="{url}"/>
    {/if}
</div>

<style>
    .media-block{
        width: 100%;
        padding-top: var(--media-padding-top);
        z-index: 1;
    }
    .media{
        width: 100%;
        object-fit: cover;
    }
    .fullWidth{
        width: calc( 100% + var(--page-side-padding) * 2) !important;
        margin-left: calc( var(--page-side-padding) * -1) !important;
        margin-right: calc( var(--page-side-padding) * 1) !important;

    }
</style>