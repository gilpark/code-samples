<script>
    import {onMount$} from "svelte-rx";
	import {map, switchMap} from "rxjs/operators";
	import {VIEWSTATE, viewState$} from "../api/store";

	let viewState = onMount$.pipe(switchMap(_ => viewState$.stream.pipe(map(h => h.replace('#', '')))))
	$:fourColor = $viewState === VIEWSTATE.FOUR
	$:philColor = $viewState === VIEWSTATE.PHIL
	$:kochColor = $viewState === VIEWSTATE.KOCH
	$:molexColor = $viewState === VIEWSTATE.MOLEX
	$:hide = $viewState === VIEWSTATE.IDLE
	const setViewState = (viewID) => viewState$.pushViewSate(viewID)
	const onFABClick = () => {
		if ($viewState === VIEWSTATE.MAIN) {
			setViewState(VIEWSTATE.FOUR)
		} else {
			setViewState(VIEWSTATE.MAIN)
		}
	}
	$:active = !($viewState === VIEWSTATE.MAIN || $viewState === VIEWSTATE.IDLE)
</script>

<div class="foot-button" class:active={active} class:hide={hide}>
	<div class="bfab-wrap">
		<div class="bfab" on:click="{onFABClick}"
			 class:fourColor={fourColor}
			 class:philColor={philColor}
			 class:kochColor={kochColor}
			 class:molexColor={molexColor}>
		</div>
	</div>
</div>
<style>
	.hide{
		display: none;
	}
	.fourColor{
		background-color: white !important;
		background-image: url('./assets/Clover_BackNoBG.png');
	}
	.philColor{
		background-color: var(--phil-main-color) !important;
		background-image: url('./assets/BackIcon_NoBG.png');
	}
	.kochColor{
		background-color: var(--koch-main-color) !important;
		background-image: url('./assets/BackIcon_NoBG.png');
	}
	.molexColor{
		background-color: var(--molex-main-color) !important;
		background-image: url('./assets/BackIcon_NoBG.png');
	}
	.foot-button {
		position: fixed;
		bottom: 200px;
		height: 350px;
		width: 100%;
		pointer-events: none;
		z-index: 99999;
	}
	/* button dest*/
	.foot-button.active .bfab-wrap {
		top: 220px;
		right: 60px;
		transition: 0.5s all ease;
	}
	.foot-button.active .bfab {
		width: 280px;
		height: 280px;
		transition: 0.5s all ease;
    }
	.foot-button.active .bfab:after {

		transition: 0.5s all ease;
		box-shadow: 0 -8px 12px 1px rgba(0, 0, 0, 0.15);
	}
	.foot-button .bfab-wrap {
		position: absolute;
		top: 50px;
		right: calc(50vw - 140px);
		bottom: 0;
		transform-origin: bottom center;
		transition: 0.3s all ease;
	}

	.foot-button .bfab {
		width: 280px;
		height: 280px;
		background-color: rgba(255, 255, 255, 0.54);
		background-position: center;
		background-repeat: no-repeat;
		background-size: 46%;
		border-radius: 50%;
		cursor: pointer;
		transition: 0.3s all ease;
		pointer-events: auto;
		position: relative;
		-webkit-tap-highlight-color: rgba(0,0,0,0);
		-webkit-tap-highlight-color: transparent;
	}
	.foot-button .bfab:after {
		content: "";
		box-shadow: 0 8px 12px 1px rgba(0, 0, 0, 0.15);
		border-radius: 50%;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		 /*background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/111167/arrow-down.svg") no-repeat center 104px transparent;*/
		transition: 0.3s all ease;
	}
	.foot-button .bfab:hover {
		/*background-color: #fff;*/
	}
</style>
