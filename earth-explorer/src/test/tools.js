function cameraLookingAt() {
    var ray = camera.getPickRay(new Cesium.Cartesian2(
        Math.round(canvas.clientWidth / 2),
        Math.round(canvas.clientHeight / 2)
    ));

    var position = viewer.scene.globe.pick(ray, viewer.scene);
    if (Cesium.defined(position)) {
        var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
        var height = cartographic.height;
        var range = Cesium.Cartesian3.distance(position, camera.position);

        return ({
            lat: Cesium.Math.toDegrees(cartographic.latitude),
            log: Cesium.Math.toDegrees(cartographic.longitude),
            height: range
        })
    } else {
        console.log('Looking at space?');
    }
}