<script>
    import '../utils/common'
    import GridCard from './GridCard.svelte'
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import {tutorialState$} from "../api/store";

    let vw
    let scx // secondColumn_x
    export let
        blockStyle = '',
        copyStyle='',
        cards = [
            { id: 1, state: false, x: 100, y: 100, name: '1 <br/>INTEGRITY', content: 'Have the courage to always act with integrity.'},
            { id: 2, state: false, x: scx, y: 100, name: '5 <br/>KNOWLEDGE', content: 'Acquire the best knowledge from any and all sources that will enable you to improve your performance. Share your knowledge proactively. Provide and solicit challenges consistently and respectfully.'},
            { id: 3, state: false, x: 100, y: 100 + ((280 + 60) * 1), name: '2 <br/>STEWARDSHIP & COMPLIANCE', content: 'Act with proper regard for the rights of others. Put safety first. Drive environmental excellence and comply with all laws and regulations. Stop, think and ask.'},
            { id: 4, state: false, x: scx, y: 100 + ((280 + 60) * 1), name: '6 <br/>HUMILITY', content: 'Be humble, intellectually honest and deal with reality constructively. Develop an accurate sense of self-worth based on your strengths, limitations and contributions. Hold yourself and others accountable to these standards.'},
            { id: 5, state: false, x: 100, y: 100 + ((280 + 60) * 2), name: '3 <br/>PRINCIPLED ENTREPRENEURSHIP<sup>™</sup>', content: 'Practice a philosophy of mutual benefit. Create superior value for the company by doing so for our customers and society. Help make Koch the preferred partner of customers, employees, suppliers, communities and other important constituencies.'},
            { id: 6, state: false, x: scx, y: 100 + ((280 + 60) * 2), name: '7 <br/>RESPECT', content: 'Treat everyone with honesty, dignity, respect and sensitivity. Embrace different perspectives, experiences, aptitudes, knowledge and skills in order to leverage the power of diversity.'},
            { id: 7, state: false, x: 100, y: 100 + ((280 + 60) * 3), name: '4 <br/>TRANSFORMATION', content: 'Transform yourself and the company. Seek, develop and utilize the visions, strategies, methods and products that will enable us to create the greatest value.'},
            { id: 8, state: false, x: scx, y: 100 + ((280 + 60) * 3), name: '8 <br/>SELF-ACTUALIZATION', content: 'Be a lifelong learner and realize your potential, which is essential for fulfillment. As you become increasingly self-actualized you will better deal with reality, face the unknown, creatively solve problems and help others succeed.'}
        ]
    
    onMount(() => {
        scx = vw - 100 - (vw/2) + 130
        cards[1].x = scx
        cards[3].x = scx
        cards[5].x = scx
        cards[7].x = scx
    })
    const onImageTouch = e =>{
        tutorialState$.update(v => ({...v, gridDone:true}))
    }
</script>

<svelte:window bind:innerWidth={vw} />
<div class="grid-expand-block " style="{blockStyle}">
    <div class="card-grid"  style="{copyStyle}" on:touchstart={onImageTouch}>
        {#each cards as card (card.id)}
            <GridCard {...card}/>
        {/each}
        {#if !$tutorialState$.gridDone}
            <img src="./assets/tapGIF_1.gif" class="tab-icon" transition:fade|local/>
        {/if}
    </div>
</div>

<style>
    .tab-icon{
        position: absolute !important;
        top: 12%;
        left: 31%;
        height: 200px !important;
        opacity: 0.7;
        width: auto !important;
        pointer-events: none !important;
        max-width: unset !important;
        max-height: unset !important;
        z-index: 111111;
    }

.grid-expand-block{
    z-index: 1;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    -webkit-tap-highlight-color: transparent;
}
.card-grid {
    position: absolute;
    top: 2100px;
    left: 0;
    width: calc(100vw - 200px);
    padding: 100px;
    height: 1300px;
    /* background: #ededed; */
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-content: stretch;
    overflow: hidden;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    -webkit-tap-highlight-color: transparent;
}
/* .card:nth-child(7), .card:nth-child(8){
  margin-bottom: 0;
} */

</style>