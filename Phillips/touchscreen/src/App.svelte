<script>
	import MainView from './views/Main.View.svelte'
	import Phil from './views/Phil.View.svelte'
	import Koch from './views/Koch.View.svelte'
	import Molex from './views/Molex.View.svelte'
	import {userInactive$, viewState$, VIEWSTATE, page_scroll} from "./api/store"
	import {map, switchMap} from "rxjs/operators"
	import {onMount$} from "svelte-rx";
	import {fade} from 'svelte/transition'
	import FlyTransition from "./components/FlyTransition.svelte";
	import FloatingActionButton from "./components/FloatingActionButton.svelte"
	import { cubicInOut } from 'svelte/easing'

	import ScreenBlock from "./components/ScreenBlock.svelte"
	import {BASE_URL} from "./api/store"
	import {onMount} from "svelte";

	$:isIdleSate = userInactive$.stream //we need to make this as reactive variable to let svelte subscribe the stream
	let viewState = onMount$.pipe(switchMap(_ => viewState$.stream.pipe(map(h => h.replace('#', '')))))

	const setViewState = (viewID) => viewState$.pushViewSate(viewID)
	let onFABClick = () => {
		if ($viewState === VIEWSTATE.MAIN || $viewState === VIEWSTATE.IDLE) {
			setViewState(VIEWSTATE.FOUR)
		} else {
			setViewState(VIEWSTATE.MAIN)
		}
	}
	let videoURL = `./assets/totem_bg.mp4`
	userInactive$.stream.subscribe(console.log)
	// const preloadImages = [
	// 	{id: 0, src: '/assets/PM/slides1/0.png'},
	// 	{id: 1, src: '/assets/PM/slides1/1.png'},
	// 	{id: 2, src: '/assets/PM/slides1/2_center.png'},
	// 	{id: 3, src: '/assets/PM/slides1/3.png'},
	// 	{id: 4, src: '/assets/PM/slides1/4.png'},
	// 	{id: 5, src: '/assets/PM/slides1/5.png'},
	// ]
	// preloadImages.forEach(({src}) =>{
	// 	const img = new Image()
	// 	img.src = src
	// 	img.onload = () => console.log('loaded')
	// })
</script>


<div class="titlebar-drag-region"></div>
<div style="width: 100%; height: 100%;" >
	<video src="{videoURL}" muted autoplay loop playsinline class="bg"></video>

	{#if  $viewState === VIEWSTATE.IDLE}
		<div style="width: 100%; height: 100%; position: fixed;" transition:fade|local={{duration: 1000, easing:cubicInOut}}>
			<video src="./assets/pm_screen_saver.mp4" muted autoplay loop playsinline style="width: 100%; height: 100%; object-fit: cover"/>
		</div>
	{/if}
	{#if $viewState  === VIEWSTATE.MAIN ||$viewState  === VIEWSTATE.FOUR }
		<FlyTransition direction="{-1}">
			<MainView/>
		</FlyTransition>
	{:else if $viewState  === VIEWSTATE.PHIL}
		<FlyTransition>
			<Phil />
		</FlyTransition>
	{:else if $viewState  === VIEWSTATE.KOCH}
		<FlyTransition>
			<Koch />
		</FlyTransition>
	{:else if $viewState  === VIEWSTATE.MOLEX}
		<FlyTransition>
			<Molex />
		</FlyTransition>
	{/if}

</div>

<FloatingActionButton callback={onFABClick}/>
<style>
	.bg{
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/*z-index: 0;*/
	}
</style>
