<script>
    import {fade} from 'svelte/transition'
    import {onMount$} from "svelte-rx";
	export let dots = [
        {
            'active': false,
            'callback': () => {}
        }
    ]

</script>

<div class="dots-wrap">

    {#each dots as dot }
        <div class="dot-button" class:active={dot.active} on:click="{dot.callback}">
        </div>
    {/each}
</div>
<style>
	.dots-wrap {
		position: fixed;
		right: 30px;
		width: 110px;
		/* height: 350px; */
		pointer-events: none;
        top: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
		z-index: 99999;
	}
    
	.dots-wrap .dot-button:after {
		transition: 0.5s all ease;
		box-shadow: 0 -8px 12px 1px rgba(0, 0, 0, 0.15);
	}

	.dots-wrap .dot-button {
		width: 48px;
		height: 48px;
		background-color: rgba(255, 255, 255, 0.54);
		background-position: center;
		background-repeat: no-repeat;
		background-size: 46%;
		border-radius: 50%;
		cursor: pointer;
		pointer-events: auto;
		position: relative;
		-webkit-tap-highlight-color: rgba(0,0,0,0);
		-webkit-tap-highlight-color: transparent;
        margin-bottom: 32px;
	}
	.dots-wrap .dot-button.active {
		width: 82px;
		height: 82px;
		background-color: rgba(255, 255, 255, 1);
		transition: 0.3s all ease;
    }
    
	.dots-wrap .dot-button:after {
		content: "";
		box-shadow: 0 8px 12px 1px rgba(0, 0, 0, 0.15);
		border-radius: 50%;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		transition: 0.3s all ease;
	}
</style>
