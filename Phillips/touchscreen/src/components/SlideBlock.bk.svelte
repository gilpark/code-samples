<script>
    import items from '../api/cards.js';
    import { Slidy } from 'svelte-slidy';
    import Spinner from './Spinner.svelte'
    import SpinNew from './SpinNew.svelte'

    let name = 'Slidy'

    const slidy = {
        slides: items,
        timeout: 1000,
        index: 4,
        wrap: {
            id: 'slidy',
            width: '100%',
            height: '50vh',
            padding: '0',
            align: 'middle',
            alignmargin: 0,
        },
        slide: {
            gap: 25,
            width: '50vw',
            height: '100%',
            backimg: false,
            imgsrckey: 'src',
            objectfit: 'cover',
            overflow: 'hidden'
        },
        controls: {
            dots: true,
            dotsnum: true,
            dotsarrow: true,
            dotspure: false,
            arrows: true,
            keys: true,
            drag: true,
            wheel: true,
        },
        options: {
            axis: 'x',
            loop: true,
            duration: 350,
        }
    }
</script>

<h1>Hello <span>{name}</span>!</h1>
<Slidy {...slidy} >
	<span slot="loader">
		<SpinNew />
	</span>
</Slidy>

<style>
    :global(#slidy span) {
        left: 50%;
        transform: translateX(-50%)
    }
    @media screen and (min-width: 900px) {
        :global(#slidy .slidy-ul li) {width: 33vw;}
    }
    @media screen and (max-width: 425px) {
        :global(#slidy .slidy-ul li) {width: 100vw;}
    }
    h1 span {color: red}
    h1 {text-align: center}
</style>