<script>
    export let direction = 1, duration = 400
    import {fade, fly,slide, scale} from 'svelte/transition'
    import { sineInOut} from 'svelte/easing'
    import BezierEasing from 'bezier-easing'
    let easing = BezierEasing(.65,0,.35,1)
</script>

<!--<div in:scale out:fly="{{ x: window.screen.width  * direction, duration: 300 }}"-->
<!--     style="width: 100%; height: 100%; position: absolute" >-->
<!--    <slot></slot>-->
<!--</div>-->

<div in:fly="{{ x:window.screen.width * direction, duration: duration, easing:easing}}"
     out:fly="{{ x: window.screen.width  * direction, duration: duration, easing:easing }}"
     style="width: 100%; height: 100%; position: absolute" >
    <slot></slot>
</div>