<script>
    import {userInactive$, viewState$, VIEWSTATE} from "../api/store"
    export let logoUrl = 'https://dummyimage.com/220x80/fff/aaa'

</script>

<div class="header-footer-block" >
    <div class="content" >
        <img src="{logoUrl}" class="logo-image">
    </div>

</div>

<style>
    .item-wrapper{
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: var(--page-side-padding);
        padding-right: var(--page-side-padding);
    }
    .home-image{
        height: 60%;
        width: auto;
    }
    .logo-image{
        height: 100%;
        width: 100%;
        object-fit: cover
    }
    .content{
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: var(--header-height);
    }
    .header-footer-block{
        width: calc( 100% + var(--page-side-padding) * 2);
        margin-left: calc( var(--page-side-padding) * -1);
        margin-right: calc( var(--page-side-padding) * 1);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        z-index: 1;
    }
</style>


