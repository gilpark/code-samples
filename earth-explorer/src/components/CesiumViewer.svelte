
<script>
    //
    import {onMount, onDestroy} from "svelte"
    import {viewer$} from "../api/stores"
    import {detectZoomLevel} from "../utils/Util.Cesium"
    import {config} from "../api/stores"

    const startLat = 37.90622013491295 //(x)
    const startLong = -97.69879936797906 //(y)
    let startHeight = $config.APP.MAX_HEIGHT

    //const connectId = 'a19b0475-92b0-48d9-b323-3918b14523a7';

    onMount(() => {
        const Cesium = window.Cesium
        Cesium.Ion.defaultAccessToken = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
        const imagery = Cesium.createDefaultImageryProviderViewModels()
        const no_label_resource = new window.Cesium.Resource({
            url: 'https://dev.virtualearth.net',
            queryParameters: {
                'st': 'mapElement|labelVisible:false'
            },
        })
        const bing = new Cesium.BingMapsImageryProvider({
            url : no_label_resource,
            key : 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS_ON_DEMAND
        })
        window.bing = bing
        console.log(bing._resource)
        const viewer = new Cesium.Viewer('cesiumContainer', {
            // terrainProvider: Cesium.createWorldTerrain(),
            // baseLayerPicker: false,
            animation: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            // imageryProvider:bing
            imageryProviderViewModels: imagery,
            selectedImageryProviderViewModel: imagery[0],
            contextOptions : {
                webgl: {
                    preserveDrawingBuffer : true
                }
            }
        })
        window.viewer = viewer




        // viewer.canvas.width = 1920
        // viewer.camera.height = 1080
        // console.log(viewer.canvas)

        const camera = viewer.camera
        const scene =  viewer.scene
        const ellipsoid = viewer.scene.mapProjection.ellipsoid
        //disable mouse scroll to zoom
        // scene.screenSpaceCameraController.enableZoom = false;
        //hide  cesium uis
        document.querySelector('.cesium-viewer-bottom').style.display = 'none'
        document.querySelector('.cesium-toolbar-button').style.display = 'none'
        //init fly
        camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(startLong, startLat, startHeight),
        })
        viewer.clock.onTick.addEventListener(function(clock) {
            // ellipsoid.cartesianToCartographic(camera.positionWC, cartographic)
            let pos = ellipsoid.cartesianToCartographic(camera.position)
            viewer$.update(d => ({
                lat: Cesium.Math.toDegrees(pos.latitude),
                long: Cesium.Math.toDegrees(pos.longitude),
                height: pos.height,
                zoomLevel: detectZoomLevel(viewer,pos.height),
                _viewer:viewer,
                block:d.block,
            }))
        })
    })

</script>
<div class="wrapper">
    <div id="cesiumContainer"></div>
</div>
<style>
    #cesiumContainer {
        width: 100%;
        height: 100vh;
    }

    .wrapper {
        width: 100%;
        height: 100vh;
        position: fixed;
        top:0;
        left:0;
    }
</style>
