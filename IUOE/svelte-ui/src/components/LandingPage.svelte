<script>
    import { onMount } from 'svelte';
    export let enterExperience = false, appName = ""

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
    const requestIOSMotion = (cb) =>{
        const android = /Android/i.test(navigator.userAgent);
        if (window.DeviceOrientationEvent) {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            console.log("IOS orientation supported - svelte");
                            window.addEventListener('deviceorientation', cb);
                        }
                    })
                    .catch(console.error);
            } else {

            }
        }
        if(android){
            console.log("Android orientation supported - svelte");
            window.addEventListener('deviceorientation',cb, false);
        }
    }

    const buttonClickHandler = e =>{
        const android = /Android/i.test(navigator.userAgent)
        const pc =  document.getElementById('app-frame').contentWindow
        const sensorCb = ({alpha, beta, gamma}) => {
            pc.postMessage(JSON.stringify({id:"sensor", data:{alpha, beta, gamma}}), "*")
        }
        if (android && !document.fullscreenElement) {
                openFullscreen()
        }
        enterExperience = true
        requestIOSMotion(sensorCb)
    }

    const getDisplayName = name =>{
        switch (name){
            case "STEAM" : return "STEAM ENGINE"
            case "PIPE" :  return "HOISTING & PORTABLE"
            case "ITEC" : return `INTERNATIONAL TRAINING<br/> & EDUCATION CENTER`
            default : return "LANDING PAGE"
        }
    }
</script>

    <div class="container">
        <h1>{@html getDisplayName(appName)}</h1>
        <button on:click|preventDefault={buttonClickHandler}>START</button>
    </div>

<style>
    .container{
        background:black;
        pointer-events: all;
        top:0; width:100%;
        height:100%; position:fixed;
        z-index:100;
        text-align:center;
        color:white;
        display:flex;
        flex-direction: column;
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