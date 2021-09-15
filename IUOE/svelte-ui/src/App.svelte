<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import Playcanvs from "./components/Playcanvs.svelte";
  import ScreenSizeHandler from "./components/ScreenSizeHandler.svelte";
  import LandingPage from "./components/LandingPage.svelte";
  import SteamPage from "./pages/SteamPage.svelte";
  import PipePage from "./pages/PipePage.svelte";
  import {isPortrait} from './store/screenSizeStore'
  import ITECpage from "./pages/ITECpage.svelte";
  import VideoBG from "./components/VideoBG.svelte";

  let enterExperience = false
  const getAppName = () =>{
      //21 == pipe
      //22 == steam
      //4 == itec
      const host = window.location.host
      if(host.includes("itec-ar.com")){
          const id = host.split('.')[0]
          console.log("your app is...", id)
          if(id === "21") return "PIPE"
          if(id === "22") return "STEAM"
          if(id === "4") return "ITEC"
      }else{
          const urlParams = new URLSearchParams(window.location.search)
          const type = urlParams.get('type')
          console.log(type)
          return type? type.toLocaleUpperCase() : "STEAM"
      }
  }
  const appName = getAppName()

</script>

<audio id="audio" src="assets/close-sound.mp3"></audio>
<audio id="play" src="assets/play-sound.mp3"></audio>
{#if !enterExperience}
    <LandingPage bind:enterExperience {appName}/>
{/if}

<VideoBG {appName}/>
{#if appName === "STEAM"}<SteamPage/>{/if}
{#if appName === "PIPE"}<PipePage/>{/if}
{#if appName === "ITEC"}<ITECpage/>{/if}

{#if $isPortrait }
    <ScreenSizeHandler/>
{/if}

<Playcanvs {appName}/>
<style>
    h1{
        color: white;
    }
    #app{
        position: fixed;
        top:0;
        left:0;
        z-index: 1;
        pointer-events: none;
    }
</style>