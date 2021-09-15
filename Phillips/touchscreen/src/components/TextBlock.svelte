<script>
    import '../utils/common'
    //input data
    export let
        blockStyle = '',
        headlineStyle = '',
        copyStyle='',
        headline = ' Lorem Ipsum placeholder text',
        copy = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Accumsan tortor posuere ac ut consequat semper viverra. In ornare quam viverra orci sagittis eu. In iaculis nunc sed augue lacus viverra vitae congue eu. Risus commodo viverra maecenas accumsan lacus vel facilisis volutpat est. Cras ornare arcu dui vivamus arcu felis bibendum ut. Sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Mi in nulla posuere sollicitudin aliquam ultrices sagittis. Diam quis enim lobortis scelerisque fermentum. Sagittis vitae et leo duis. Faucibus turpis in eu mi bibendum. Tincidunt augue interdum velit euismod in pellentesque massa placerat. Vitae suscipit tellus mauris a diam maecenas sed. Etiam sit amet nisl purus in.'


</script>

<div class="text-block " style="{blockStyle}">
    {#if !headline.isEmpty()}
        <div class="title"  style="{headlineStyle}">
            {@html headline}
        </div>
    {/if}
    {#if !copy.isEmpty()}
        <div class="copy"  style="{copyStyle}">
            {@html copy}
        </div>
    {/if}
</div>

<style>
    .text-block{
        width: 100%;
        z-index: 1;
    }
    .title{
        pointer-events: none;
        user-select:none;
    }
    .copy{
        pointer-events: none;
        user-select:none;
    }
</style>