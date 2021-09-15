<script>
    import {onMount} from "svelte";

    export let state = 0,
        id = -1,
        name = 'card',
        content = '...stuff',
        x, y

    import {Koch_selectedCard} from '../api/store'

    let onCardClick = (target) => {
        state = !state
        $Koch_selectedCard = state?id : -1
    }

    onMount(()=>{
        return ()=>{
            $Koch_selectedCard = -1
        }
    })
</script>

<div class="card {state ? 'is-expanded' : 'is-collapsed'}" class:hide={$Koch_selectedCard !== -1 && $Koch_selectedCard !== id} on:click={onCardClick} style={state ? 'top:100px;left:100px;' : "left: "+ x +"px; top: "+ y +"px;"}>
    <div class="card__inner js-expander"><span>{@html name}</span></div>
    <div class="card__expander" ><div class="grid-back-btn"><img src="./assets/Koch/Koch_4x4Grid_BackIcon.png" alt="grid-back"></div> {@html content}</div>
</div>

<style>

    .hide{
        opacity: 0 !important;
    }
    .card{
        transition: all 0.4s ease-in-out;
        position: absolute;
        width: calc(1030px - 80px);
        height: 280px;
        margin-bottom: 60px;
        /* background-color: #949fb0; */
        background: var(--koch-main-color);
    }

    .card__inner {
        /*transition: all 0.4s ease-in-out;*/
        color: #eceef1;
        cursor: pointer;
        
        font-size: 1.6em;
        line-height: 1.3em;
        font-weight: 500;
        padding-top: 70px;
       
        position: relative;
        text-align: center;
        /* letter-spacing: 0.1rem; */
    }
    .card.is-collapsed .card__expander {
        opacity: 0;
        overflow: hidden;
        margin-top: 0;
        max-height: 0;
        min-height: 0;
    }


    .card.is-expanded {
        width: calc(100vw - 200px);
        height: calc(100% - 200px);
        z-index: 999;
    }
    .card.is-expanded .card__inner {
        text-align: left;
        padding-left: 120px;
        /* transition: all 0.6s ease-in-out; */
    }
    .card.is-expanded .card__expander {
        color: #eceef1;
        
        font-size: 2em;
        text-align: left;
        padding: 30px 120px;
        /* font-weight: 600; */
        animation: fadeIn linear 1s;
        /* letter-spacing: 0.1rem; */
        /*animation-delay: 500ms;*/
        /*-webkit-animation: fadeIn linear 1s;*/
        /*-moz-animation: fadeIn linear 1s;*/
        /*-o-animation: fadeIn linear 1s;*/
        /*-ms-animation: fadeIn linear 1s;*/
    }
    .card.is-expanded .card__expander::before {
    }
    .grid-back-btn{
        position: absolute;
        bottom: 60px;
    }
    @keyframes fadeIn {
        0% {
            opacity:0;
        }
        30% {
            opacity:0;
        }
        100% {opacity:1;}
    }



</style>