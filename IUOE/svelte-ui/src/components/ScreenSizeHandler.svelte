<script>
    import { onMount } from 'svelte';
    // import {isPortrait} from '../store/screenSizeStore'

    onMount(()=>{
        setTimeout(function () {
            window.scroll(0, -100000);
        }, 1000);
        if(document.getElementById('app-frame')){
            const pc = document.getElementById('app-frame').contentWindow
            pc.postMessage(JSON.stringify({action:"pause", pause:true}), "*")
        }

        return ()=>{
            const pc = document.getElementById('app-frame').contentWindow
            pc.postMessage(JSON.stringify({action:"pause", pause:false}), "*")
        }
    })
</script>

    <div class="container">
        <p class="content">Turn your phone to start the experience.</p>
    </div>

<style>
    .container{
        background:black;
        pointer-events: all;
        top:0; width:100%;
        height:100%; position:fixed;
        z-index:3;
        text-align:center;
        color:white;
        display:flex;
        align-content: center;
        align-items: center;
        justify-content: center;
    }
    .content{
        padding:1rem;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -o-user-select: none;
        user-select: none;
    }
</style>