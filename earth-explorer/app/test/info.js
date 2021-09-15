var viewer = new Cesium.Viewer('cesiumContainer', {
    navigationHelpButton: false,
    animation: false,
    timeline: false
});

var cartographic = new Cesium.Cartographic();
var cartesian = new Cesium.Cartesian3();
var camera = viewer.scene.camera;
var ellipsoid = viewer.scene.mapProjection.ellipsoid;
var toolbar = document.getElementById('toolbar');
toolbar.innerHTML = '<div id="hud"></div>' +
    '<button type="button" class="cesium-button" id="h1km">1km height</button>' +
    '<button type="button" class="cesium-button" id="h10km">10km height</button>' +
    '<button type="button" class="cesium-button" id="h500km">500km height</button>';

toolbar.setAttribute('style', 'background: rgba(42,42,42,0.9); border-radius: 5px;');

var hud = document.getElementById('hud');

viewer.clock.onTick.addEventListener(function(clock) {
    ellipsoid.cartesianToCartographic(camera.positionWC, cartographic);
    hud.innerHTML =
        'Lon: ' + Cesium.Math.toDegrees(cartographic.longitude).toFixed(3) + ' deg<br/>' +
        'Lat: ' + Cesium.Math.toDegrees(cartographic.latitude).toFixed(3) + ' deg<br/>' +
        'Alt: ' + (cartographic.height * 0.001).toFixed(1) + ' km';
});

function setHeightKm(heightInKilometers) {
    ellipsoid.cartesianToCartographic(camera.position, cartographic);
    cartographic.height = heightInKilometers * 1000;  // convert to meters
    ellipsoid.cartographicToCartesian(cartographic, cartesian);
    camera.position = cartesian;
}

document.getElementById('h1km').addEventListener('click', function() {
    setHeightKm(1);
}, false);

document.getElementById('h10km').addEventListener('click', function() {
    setHeightKm(10);
}, false);

document.getElementById('h500km').addEventListener('click', function() {
    setHeightKm(500);
}, false);