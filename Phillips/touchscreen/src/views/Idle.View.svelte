<script>
    import PageBlock from "../components/ScreenBlock.svelte";
    const IdleStyle = `
        position: absolute;
        width: 100%;
        height: 100vh;
        background: #9b7b73;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1111;`
</script>

<PageBlock contentStyle="{IdleStyle}">
    <div class="title">{'IDLE'}</div>
</PageBlock>

<style>
    .title{
        text-align: center;
        font-size: 20rem;
        color: white;
    }

    .page{
        position: absolute;
        width: 100%;
        height: 100vh;
        background: #9b7b73;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1111;
    }
</style>
