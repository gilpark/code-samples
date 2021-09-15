<script>
	import { onMount, tick, setContext } from 'svelte'
	import {vector, calc, } from '@js-basics/vector'
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { writable } from 'svelte/store'
	export let current = 0
	export let direction = 'horizontal'
	export let numScreens = 2
	export let speed = 1
	export let block = false
	let el
	let dragging = false
	let initialPosition = vector()
	let lastPosition = vector()
	let draggedPixels = 0
	let draggedBack
	let jumpEnabled = true
	let clientHeight
	let clientWidth
	export let duration = 400, easing = cubicOut

	export const progress = tweened(current, {
		duration: duration,
		easing: easing
	})
	export const context = writable({
		jump,
		next,
		prev,
		progress,
		numScreens
	})
	setContext('swipeable', context)
	$: current = Math.floor($progress+0.5)
	$: positionField = direction == 'vertical' ? 'pageY' : 'pageX'
	$: maxSlideIndex = $context.numScreens - 1
	$: size = direction == 'vertical' ? clientHeight : clientWidth
	let blockEvent = false
	onMount(function() {
		draggedPixels = current * (direction == 'vertical' ? clientHeight : clientWidth)
	})

	export function next(e) {
		if (e) e.stopPropagation()
		if (dragging) return
		draggedPixels += size
		$progress = (draggedPixels / size) || 0
		// if (draggedPixels < maxSlideIndex * size) draggedPixels = 0
	}
	export function prev(e) {
		if (e) e.stopPropagation()
		if (dragging) return
		draggedPixels -= size
		$progress = (draggedPixels / size) || 0
		// if (draggedPixels > 0) draggedPixels = 0
	}

	function startMove(startPosition) {
		if(block) return;
		draggedPixels = $progress * size
		dragging = true
		lastPosition = startPosition.clone();
		initialPosition = startPosition.clone()
	}
	function move(position) {
		if(block) return;
		if (!dragging) return
		let delta = calc(()=>position - lastPosition)
		let angleDelta = calc(()=>position - initialPosition)
		let rad =  Math.atan2(angleDelta.y,angleDelta.x);
		const sin = Math.abs(Math.sin(rad)).toFixed(3) //y
		const cos = Math.abs(Math.cos(rad)).toFixed(3) //x
		const isVertical = direction === 'vertical'
		const inRange = (isVertical ?cos :sin) < 0.85 //angle threshold
		//todo wish list: ignore when inRange value is jumpy
		blockEvent = inRange
		if(!inRange) return

		lastPosition = position.clone()
		const d = direction==='vertical'? delta.y : delta.x
		draggedPixels -= d * speed
		if (draggedPixels < 0) draggedPixels = 0
		if (draggedPixels > maxSlideIndex * size) draggedPixels = maxSlideIndex * size
		draggedBack = d < 0
		jumpEnabled = false
		$progress = (draggedPixels / size) || 0
	}
	function stopMove() {
		if (draggedBack) draggedPixels = Math.ceil(draggedPixels / size) * size
		else draggedPixels = Math.floor(draggedPixels / size) * size
		dragging = false
		stopTimeout = null
		clearTimeout(stopTimeout)
		$progress = (draggedPixels / size) || 0
		// when release the mouse, the click event gets fired, calling the jump function, undoing the drag.
		// disable jump for one tick.
		setTimeout((() => jumpEnabled = true), 10)
		// clearTimeout(nextSlideTimeout)
		// nextSlideTimeout = setTimeout(nextSlide, 10000)
	}
	function mousedown(e) {
		//e.preventDefault()
		const x = e.pageX
		const y = e.pageY
		const point = vector(x,y)
		startMove(point)
	}
	function mouseup(e) {
		stopMove()
	}
	function mousemove(e) {
		e.preventDefault()
		if (stopTimeout) return // we just used the wheel
		const x = e.pageX
		const y = e.pageY
		const point = vector(x,y)
		move(point)
	}
	function touchstart(e) {
		// e.preventDefault()
		const x = e.changedTouches[0].pageX
		const y = e.changedTouches[0].pageY
		const point = vector(x,y)
		startMove(point)
	}
	function touchend(e) {
		stopMove()
	}

	function pointercancel(e) {
		dragging = false
	}

	export function jump(i){
		if (!jumpEnabled) return
		draggedPixels = i * size
		$progress = i
	}
	function click(e) {
		e.stopPropagation()
	}

	function touchmove(e) {
		e.preventDefault()
		if(blockEvent){
			e.stopPropagation()
		}
		const x = e.changedTouches[0].pageX
		const y = e.changedTouches[0].pageY
		const point = vector(x,y)
		move(point)
	}

	let stopTimeout
	function wheel(e) {
		let delta = vector(-e.deltaX,-e.deltaY)
		if (delta.x !== 0 || delta.y !== 0) e.preventDefault()

		startMove(vector())
		move(delta)
		clearTimeout(stopTimeout)
		stopTimeout = setTimeout(stopMove, 100)
	}
</script>

<div bind:clientWidth
	 bind:clientHeight
	 on:pointercancel={pointercancel}
	 on:touchstart={touchstart}
	 on:touchmove={touchmove}
	 on:touchend={touchend}
	 on:mousedown={mousedown}
	 on:mousemove={mousemove}
	 on:mouseup={mouseup}
	 on:wheel={wheel}
	 on:click={click}
	 bind:this={el}
	 class="swipeable">
	<slot {current} {jump} progress={$progress}></slot>
</div>

<style>
	.swipeable {
		width: 100%;
		height: 100%;
	}
</style>