<script>
    export let src, alt, style
  
    import { onMount } from 'svelte'
  
    let loaded = false
    let thisImage
  
    onMount(() => {
      thisImage.onload = () => {
        loaded = true
      }
    }) 
  
  </script>
  
  <style>
    img {
      min-height: 50px;
      opacity: 0;
      transition: opacity 1200ms ease-out;
    }
    img.loaded {
      opacity: 1;
    }
  </style>
  
  <img {src} {alt} {style} class:loaded bind:this={thisImage} />